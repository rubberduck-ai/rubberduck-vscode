import { webviewApi } from "@rubberduck/common";
import { OpenAIClient } from "../openai/OpenAIClient";

export abstract class Conversation {
  readonly id: string;
  protected readonly openAIClient: OpenAIClient;
  protected state: webviewApi.Conversation["state"];
  protected readonly messages: webviewApi.Message[];
  protected readonly updateChatPanel: () => Promise<void>;

  protected readonly initVariables: Record<string, unknown>;

  constructor({
    id,
    openAIClient,
    initialState,
    updateChatPanel,
    initVariables,
  }: {
    id: string;
    openAIClient: OpenAIClient;
    initialState: webviewApi.Conversation["state"];
    updateChatPanel: () => Promise<void>;
    initVariables: Record<string, unknown>;
  }) {
    this.id = id;
    this.openAIClient = openAIClient;
    this.state = initialState;
    this.updateChatPanel = updateChatPanel;
    this.messages = [];
    this.initVariables = initVariables;
  }

  abstract retry(): Promise<void>;

  abstract answer(userMessage?: string): Promise<void>;

  abstract getTitle(): Promise<string>;

  abstract isTitleMessage(): boolean;

  abstract getCodicon(): string;

  protected async addUserMessage({
    content,
    botAction,
  }: {
    content: string;
    botAction?: string;
  }) {
    this.messages.push({ author: "user", content });
    this.state = { type: "waitingForBotAnswer", botAction };
    await this.updateChatPanel();
  }

  protected async addBotMessage({
    content,
    responsePlaceholder,
  }: {
    content: string;
    responsePlaceholder?: string;
  }) {
    this.messages.push({ author: "bot", content });
    this.state = { type: "userCanReply", responsePlaceholder };
    await this.updateChatPanel();
  }

  protected async setErrorStatus({ errorMessage }: { errorMessage: string }) {
    this.state = { type: "error", errorMessage };
    await this.updateChatPanel();
  }

  async toWebviewConversation(): Promise<webviewApi.Conversation> {
    return {
      id: this.id,
      header: {
        title: await this.getTitle(),
        isTitleMessage: this.isTitleMessage(),
        codicon: this.getCodicon(),
      },
      messages: this.isTitleMessage() ? this.messages.slice(1) : this.messages,
      state: this.state,
    };
  }
}
