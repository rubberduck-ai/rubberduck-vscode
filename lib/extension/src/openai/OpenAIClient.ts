import axios, { AxiosError } from "axios";
import { IncomingMessage } from "http";
import secureJSON from "secure-json-parse";
import * as vscode from "vscode";
import zod from "zod";
import { Logger } from "../logger";
import { ApiKeyManager } from "./ApiKeyManager";

export function getVSCodeOpenAIBaseUrl(): string {
  return vscode.workspace
    .getConfiguration("rubberduck.openAI")
    .get("baseUrl", "https://api.openai.com/v1/");
}

const chatCompletionStreamSchema = zod.object({
  id: zod.string(),
  object: zod.literal("chat.completion.chunk"),
  created: zod.number(),
  model: zod.string(),
  choices: zod
    .array(
      zod.object({
        delta: zod.object({
          role: zod.literal("assistant").optional(),
          content: zod.string().optional(),
        }),
        index: zod.number(),
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
  private openAIBaseUrl: string;

  constructor({
    apiKeyManager,
    logger,
    openAIBaseUrl,
  }: {
    apiKeyManager: ApiKeyManager;
    logger: Logger;
    openAIBaseUrl: string;
  }) {
    this.apiKeyManager = apiKeyManager;
    this.logger = logger;
    // Ensure it doesn't have a trailing slash
    this.openAIBaseUrl = openAIBaseUrl.replace(/\/$/, "");
  }

  private getApiKey() {
    return this.apiKeyManager.getOpenAIApiKey();
  }

  setOpenAIBaseUrl(openAIBaseUrl: string) {
    // Ensure it doesn't have a trailing slash
    this.openAIBaseUrl = openAIBaseUrl.replace(/\/$/, "");
  }

  async generateChatCompletion({
    messages,
    maxTokens,
    stop,
    model,
    temperature = 0,
    streamHandler,
  }: {
    messages: Array<{
      role: "assistant" | "user" | "system";
      content: string;
    }>;
    model: "gpt-4" | "gpt-3.5-turbo";
    maxTokens: number;
    stop?: string[] | undefined;
    temperature?: number | undefined;
    streamHandler: (stream: string) => void;
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
      JSON.stringify(messages),
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

      this.logger.debug([
        "OpenAI API key retrieved",
        `Execute POST request to OpenAI (url=${this.openAIBaseUrl}, max_tokens=${maxTokens}, temperature=${temperature})`,
      ]);

      const response = await axios.post(
        `${this.openAIBaseUrl}/chat/completions`,
        {
          model,
          messages,
          max_tokens: maxTokens,
          stop,
          temperature,
          frequency_penalty: 0,
          presence_penalty: 0,
          stream: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          responseType: "stream",
        }
      );

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
                const result = chatCompletionStreamSchema.parse(
                  secureJSON.parse(line.substring("data: ".length))
                );

                responseUntilNow += result.choices[0]?.delta.content ?? "";

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
        `${this.openAIBaseUrl}/embeddings`,
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
