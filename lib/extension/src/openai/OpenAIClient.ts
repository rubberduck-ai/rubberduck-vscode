import axios, { AxiosError } from "axios";
import secureJSON from "secure-json-parse";
import zod from "zod";
import { ApiKeyManager } from "./ApiKeyManager";

export const OpenAICompletionSchema = zod.object({
  id: zod.string(),
  object: zod.literal("text_completion"),
  created: zod.number(),
  model: zod.string(),
  choices: zod
    .array(
      zod.object({
        text: zod.string(),
        index: zod.number(),
        logprobs: zod.nullable(zod.any()),
        finish_reason: zod.string(),
      })
    )
    .length(1),
  usage: zod.object({
    prompt_tokens: zod.number(),
    completion_tokens: zod.number(),
    total_tokens: zod.number(),
  }),
});

const streamSchema = zod.object({
  id: zod.string(),
  object: zod.literal("text_completion"),
  created: zod.number(),
  model: zod.string(),
  choices: zod
    .array(
      zod.object({
        text: zod.string(),
        index: zod.number(),
        logprobs: zod.nullable(zod.any()),
        finish_reason: zod.nullable(zod.string()),
      })
    )
    .min(1),
});

export class OpenAIClient {
  private readonly apiKeyManager: ApiKeyManager;
  private readonly isPromptLoggingEnabled: () => Promise<boolean>;
  private readonly log: (message: string) => void;

  constructor({
    apiKeyManager,
    isPromptLoggingEnabled,
    log,
  }: {
    apiKeyManager: ApiKeyManager;
    isPromptLoggingEnabled: () => Promise<boolean>;
    log: (message: string) => void;
  }) {
    this.apiKeyManager = apiKeyManager;
    this.isPromptLoggingEnabled = isPromptLoggingEnabled;
    this.log = log;
  }

  private getApiKey() {
    return this.apiKeyManager.getOpenAIApiKey();
  }

  async generateCompletion({
    prompt,
    maxTokens,
    stop,
    temperature = 0,
    streamHandler,
  }: {
    prompt: string;
    maxTokens: number;
    stop?: string[] | undefined;
    temperature?: number | undefined;
    streamHandler?: (stream: string) => void;
  }): Promise<
    | {
        type: "success";
        content: string;
      }
    | {
        type: "error";
        errorMessage: string;
      }
  > {
    if (await this.isPromptLoggingEnabled()) {
      this.log("--- Start OpenAI prompt ---");
      this.log(prompt);
      this.log("--- End OpenAI prompt ---");
    }

    try {
      const apiKey = await this.getApiKey();

      if (apiKey == undefined) {
        return {
          type: "error",
          errorMessage:
            "No OpenAI API key found. Please enter your OpenAI API key with the 'Rubberduck: Enter OpenAI API key' command.",
        };
      }

      const isStreaming = streamHandler != null;

      const response = await axios.post(
        `https://api.openai.com/v1/completions`,
        {
          model: "text-davinci-003",
          prompt,
          max_tokens: maxTokens,
          stop,
          temperature,
          // top_p is excluded because temperature is set
          best_of: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          stream: isStreaming,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          responseType: isStreaming ? "stream" : undefined,
        }
      );

      if (isStreaming) {
        const streamEnd = new Promise<string>((resolve, reject) => {
          try {
            let responseUntilNow = "";
            let resolved = false;

            response.data.on("data", (chunk: Buffer) => {
              const chunkText = chunk.toString();
              try {
                if (chunkText.trim() === "data: [DONE]") {
                  if (!resolved) {
                    resolved = true;
                    resolve(responseUntilNow);
                  }
                  return;
                }

                const result = streamSchema.parse(
                  secureJSON.parse(chunkText.substring("data: ".length))
                );

                responseUntilNow += result.choices[0]?.text ?? "";

                streamHandler(responseUntilNow);
              } catch (error) {
                reject(error);
              }
            });

            response.data.on("end", () => {
              if (!resolved) {
                resolved = true;
                resolve(responseUntilNow);
              }
            });
          } catch (error) {
            reject(error);
          }
        });

        const completion = await streamEnd;

        return {
          type: "success",
          content: completion,
        };
      } else {
        const completion = OpenAICompletionSchema.parse(response.data)
          .choices[0]?.text;

        if (completion == undefined) {
          return {
            type: "error",
            errorMessage: "No completion found",
          };
        }

        return {
          type: "success",
          content: completion,
        };
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        // extract error message from OpenAI response:
        const message: string | undefined = error.response?.data.error.message;

        return {
          type: "error",
          errorMessage: message ?? "Unknown error",
        };
      }

      return {
        type: "error",
        errorMessage: "Unknown error",
      };
    }
  }
}
