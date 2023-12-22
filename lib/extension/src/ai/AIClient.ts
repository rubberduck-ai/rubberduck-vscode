import {
  Llama2Prompt,
  OpenAIApiConfiguration,
  OpenAITextEmbeddingResponse,
  TextInstructionPrompt,
  TextStreamingModel,
  embed,
  llamacpp,
  openai,
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
      "gpt-4-1106-preview",
      "gpt-3.5-turbo",
      "gpt-3.5-turbo-16k",
      "gpt-3.5-turbo-1106",
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

  async getTextStreamingModel({
    maxTokens,
    stop,
    temperature = 0,
  }: {
    maxTokens: number;
    stop?: string[] | undefined;
    temperature?: number | undefined;
  }): Promise<TextStreamingModel<TextInstructionPrompt>> {
    const modelConfiguration = getModel();

    return modelConfiguration === "llama.cpp"
      ? llamacpp
          .TextGenerator({
            maxGenerationTokens: maxTokens,
            stopSequences: stop,
            temperature,
          })
          // TODO the prompt format needs to be configurable for non-Llama2 models
          .withTextPromptTemplate(Llama2Prompt.instruction())
      : openai
          .ChatTextGenerator({
            api: await this.getOpenAIApiConfiguration(),
            model: modelConfiguration,
            maxGenerationTokens: maxTokens,
            stopSequences: stop,
            temperature,
            frequencyPenalty: 0,
            presencePenalty: 0,
          })
          .withInstructionPrompt();
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

    return streamText(
      await this.getTextStreamingModel({ maxTokens, stop, temperature }),
      { instruction: prompt }
    );
  }

  async generateEmbedding({ input }: { input: string }) {
    try {
      const { embedding, response } = await embed(
        openai.TextEmbedder({
          api: await this.getOpenAIApiConfiguration(),
          model: "text-embedding-ada-002",
        }),
        input,
        { fullResponse: true }
      );

      return {
        type: "success" as const,
        embedding,
        totalTokenCount: (response as OpenAITextEmbeddingResponse).usage
          .total_tokens,
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
