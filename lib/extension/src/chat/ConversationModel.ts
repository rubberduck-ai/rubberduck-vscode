import { webviewApi } from "@rubberduck/common";
import { OpenAIClient } from "../openai/OpenAIClient";

export abstract class ConversationModel {
  protected readonly id: string;
  protected readonly openAIClient: OpenAIClient;
  protected state: webviewApi.Conversation["state"];
  protected readonly messages: webviewApi.Message[];
  protected readonly updateChatPanel: () => Promise<void>;

  constructor({
    id,
    openAIClient,
    initialState,
    updateChatPanel,
  }: {
    id: string;
    openAIClient: OpenAIClient;
    initialState: webviewApi.Conversation["state"];
    updateChatPanel: () => Promise<void>;
  }) {
    this.id = id;
    this.openAIClient = openAIClient;
    this.state = initialState;
    this.updateChatPanel = updateChatPanel;
    this.messages = [];
  }

  abstract retry(): Promise<void>;

  abstract answer(userMessage?: string): Promise<void>;

  abstract getTrigger(): webviewApi.Conversation["trigger"];

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

  toWebviewConversation(): webviewApi.Conversation {
    return {
      id: this.id,
      trigger: this.getTrigger(),
      messages: this.messages,
      state: this.state,
    };
  }
}
