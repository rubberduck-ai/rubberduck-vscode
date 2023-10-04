import {
  OpenAIApiConfiguration,
  OpenAIChatModel,
  OpenAITextEmbeddingModel,
  embed,
  streamText,
} from "modelfusion";
import * as vscode from "vscode";
import { Logger } from "../logger";
import { ApiKeyManager } from "./ApiKeyManager";

export function getVSCodeOpenAIBaseUrl(): string {
  return vscode.workspace
    .getConfiguration("rubberduck.openAI")
    .get("baseUrl", "https://api.openai.com/v1/");
}

export class AIClient {
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

  private async getApiConfiguration() {
    const apiKey = await this.apiKeyManager.getOpenAIApiKey();

    if (apiKey == undefined) {
      throw new Error(
        "No OpenAI API key found. " +
          "Please enter your OpenAI API key with the 'Rubberduck: Enter OpenAI API key' command."
      );
    }

    return new OpenAIApiConfiguration({
      baseUrl: this.openAIBaseUrl,
      apiKey,
    });
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
    model: "gpt-4" | "gpt-4-32k" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k";
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
      const textStream = await streamText(
        new OpenAIChatModel({
          api: await this.getApiConfiguration(),
          model,
          maxCompletionTokens: maxTokens,
          temperature,
          frequencyPenalty: 0,
          presencePenalty: 0,
          stopSequences: stop,
        }),
        messages
      );

      let responseUntilNow = "";
      for await (const chunk of textStream) {
        responseUntilNow += chunk;
        streamHandler(responseUntilNow);
      }

      return {
        type: "success",
        content: responseUntilNow,
      };
    } catch (error) {
      this.logger.error(`Error streaming text from OpenAI: ${error}`);

      return {
        type: "error",
        errorMessage: `Error streaming text from OpenAI: ${error}`,
      };
    }
  }

  async generateEmbedding({ input }: { input: string }) {
    try {
      const { output, response } = await embed(
        new OpenAITextEmbeddingModel({
          api: await this.getApiConfiguration(),
          model: "text-embedding-ada-002",
        }),
        input
      ).asFullResponse();

      return {
        type: "success" as const,
        embedding: output,
        totalTokenCount: response[0]!.usage.total_tokens,
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
