import axios, { AxiosError } from "axios";
import { IncomingMessage } from "http";
import secureJSON from "secure-json-parse";
import zod from "zod";
import { Logger } from "../logger";
import { ApiKeyManager } from "./ApiKeyManager";

const completionSchema = zod.object({
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

const embeddingSchema = zod.object({
  object: zod.literal("list"),
  data: zod
    .array(
      zod.object({
        object: zod.literal("embedding"),
        embedding: zod.array(zod.number()),
        index: zod.number(),
      })
    )
    .length(1),
  model: zod.string(),
  usage: zod.object({
    prompt_tokens: zod.number(),
    total_tokens: zod.number(),
  }),
});

export class OpenAIClient {
  private readonly apiKeyManager: ApiKeyManager;
  private readonly logger: Logger;

  constructor({
    apiKeyManager,
    logger,
  }: {
    apiKeyManager: ApiKeyManager;
    logger: Logger;
  }) {
    this.apiKeyManager = apiKeyManager;
    this.logger = logger;
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
    this.logger.log([
      "--- Start OpenAI prompt ---",
      prompt,
      "--- End OpenAI prompt ---",
    ]);

    try {
      this.logger.debug("Fetch OpenAI API key");
      const apiKey = await this.getApiKey();

      if (apiKey == undefined) {
        this.logger.error("No OpenAI API key found");
        return {
          type: "error",
          errorMessage:
            "No OpenAI API key found. Please enter your OpenAI API key with the 'Rubberduck: Enter OpenAI API key' command.",
        };
      }

      const isStreaming = streamHandler != null;

      this.logger.debug([
        "OpenAI API key retrieved",
        `Execute POST request to OpenAI (max_tokens=${maxTokens}, temperature=${temperature}, isStreaming=${isStreaming})`,
      ]);

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
              this.logger.debug([
                `Streaming data, process chunk (chunk size=${chunkText.length})`,
              ]);

              try {
                // sometimes chunks contain multiple data: lines
                const lines = chunkText
                  .split("\n")
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0);

                for (const line of lines) {
                  if (line.trim() === "data: [DONE]") {
                    this.logger.debug("Processed last line of chunk");
                    if (!resolved) {
                      resolved = true;
                      resolve(responseUntilNow);
                    } else {
                      this.logger.debug(
                        "Stream was already resolved. Do nothing."
                      );
                    }
                    return;
                  }

                  this.logger.debug("Process next line of chunk");
                  const result = streamSchema.parse(
                    secureJSON.parse(line.substring("data: ".length))
                  );

                  responseUntilNow += result.choices[0]?.text ?? "";

                  streamHandler(responseUntilNow);
                }
              } catch (error) {
                this.logger.error(["Failed to process chunk", chunkText]);
                reject(error);
              }
            });

            response.data.on("end", () => {
              if (resolved) {
                this.logger.debug(
                  "Stream ended but was already resolved. Do nothing."
                );
                return;
              }

              this.logger.debug("Stream ended");
              resolved = true;
              resolve(responseUntilNow);
            });
          } catch (error) {
            this.logger.error("Streaming error");
            reject(error);
          }
        });

        this.logger.debug("Streaming the response");
        const completion = await streamEnd;

        this.logger.debug("Stream completed successfully");
        return {
          type: "success",
          content: completion,
        };
      } else {
        this.logger.debug(["Not streaming response)", "Parse the response"]);
        const completion = completionSchema.parse(response.data).choices[0]
          ?.text;

        if (completion == undefined) {
          this.logger.error("No completion found in the response");
          return {
            type: "error",
            errorMessage: "No completion found",
          };
        }

        this.logger.debug("Response processed successfully");
        return {
          type: "success",
          content: completion,
        };
      }
    } catch (error) {
      this.logger.error("Something went wrong with OpenAI");

      if (error instanceof AxiosError) {
        let data = error.response?.data;

        // streaming: need to resolve data
        if (data instanceof IncomingMessage) {
          const content = data.read().toString();
          data = secureJSON.parse(content);
        }

        // extract error message from OpenAI response:
        const message: string | undefined = data?.error?.message;

        if (message != null) {
          this.logger.error(`Error received: ${message}`);
          return {
            type: "error",
            errorMessage: message,
          };
        }

        this.logger.error(
          `Unknown error calling OpenAI API (status=${error.status})`
        );
        return {
          type: "error",
          errorMessage: `Unknown error calling OpenAI API (status=${error.status})`,
        };
      }

      this.logger.error("Unknown error");
      return {
        type: "error",
        errorMessage: "Unknown error",
      };
    }
  }

  async generateEmbedding({ input }: { input: string }) {
    try {
      const apiKey = await this.getApiKey();

      if (apiKey == undefined) {
        return {
          type: "error" as const,
          errorMessage:
            "No OpenAI API key found. Please enter your OpenAI API key with the 'Rubberduck: Enter OpenAI API key' command.",
        };
      }
      const response = await axios.post(
        `https://api.openai.com/v1/embeddings`,
        {
          model: "text-embedding-ada-002",
          input,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const result = embeddingSchema.parse(response.data);

      return {
        type: "success" as const,
        embedding: result.data[0]!.embedding,
        totalTokenCount: result.usage.total_tokens,
      };
    } catch (error: any) {
      console.log(error);

      return {
        type: "error" as const,
        errorMessage: error?.message,
      };
    }
  }
}
