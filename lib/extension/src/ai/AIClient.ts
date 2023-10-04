import {
  LlamaCppTextGenerationModel,
  OpenAIApiConfiguration,
  OpenAIChatModel,
  OpenAITextEmbeddingModel,
  embed,
  mapInstructionPromptToLlama2Format,
  mapInstructionPromptToOpenAIChatFormat,
  streamText,
} from "modelfusion";
import * as vscode from "vscode";
import { z } from "zod";
import { Logger } from "../logger";
import { ApiKeyManager } from "./ApiKeyManager";

function getOpenAIBaseUrl(): string {
  return (
    vscode.workspace
      .getConfiguration("rubberduck.openAI")
      .get("baseUrl", "https://api.openai.com/v1/")
      // Ensure that the base URL doesn't have a trailing slash:
      .replace(/\/$/, "")
  );
}

function getModel() {
  return z
    .enum([
      "gpt-4",
      "gpt-4-32k",
      "gpt-3.5-turbo",
      "gpt-3.5-turbo-16k",
      "llama.cpp",
    ])
    .parse(vscode.workspace.getConfiguration("rubberduck").get("model"));
}

export class AIClient {
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

  private async getOpenAIApiConfiguration() {
    const apiKey = await this.apiKeyManager.getOpenAIApiKey();

    if (apiKey == undefined) {
      throw new Error(
        "No OpenAI API key found. " +
          "Please enter your OpenAI API key with the 'Rubberduck: Enter OpenAI API key' command."
      );
    }

    return new OpenAIApiConfiguration({
      baseUrl: getOpenAIBaseUrl(),
      apiKey,
    });
  }

  async streamText({
    prompt,
    maxTokens,
    stop,
    temperature = 0,
  }: {
    prompt: string;
    maxTokens: number;
    stop?: string[] | undefined;
    temperature?: number | undefined;
  }) {
    this.logger.log(["--- Start prompt ---", prompt, "--- End prompt ---"]);

    const modelConfiguration = getModel();

    if (modelConfiguration === "llama.cpp") {
      return streamText(
        new LlamaCppTextGenerationModel({
          maxCompletionTokens: maxTokens,
          stopSequences: stop,
          temperature,
        }).withPromptFormat(mapInstructionPromptToLlama2Format()),
        { instruction: prompt }
      );
    }

    return streamText(
      new OpenAIChatModel({
        api: await this.getOpenAIApiConfiguration(),
        model: modelConfiguration,
        maxCompletionTokens: maxTokens,
        stopSequences: stop,
        temperature,
        frequencyPenalty: 0,
        presencePenalty: 0,
      }).withPromptFormat(mapInstructionPromptToOpenAIChatFormat()),
      { instruction: prompt }
    );
  }

  async generateEmbedding({ input }: { input: string }) {
    try {
      const { output, response } = await embed(
        new OpenAITextEmbeddingModel({
          api: await this.getOpenAIApiConfiguration(),
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
