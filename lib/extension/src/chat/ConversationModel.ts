import { webviewApi } from "@rubberduck/common";
import { OpenAIClient } from "../openai/OpenAIClient";

export abstract class ConversationModel {
  protected readonly id: string;
  protected readonly openAIClient: OpenAIClient;
  protected state: webviewApi.Conversation["state"];
  protected readonly messages: webviewApi.Message[];

  constructor({
    id,
    openAIClient,
    initialState,
  }: {
    id: string;
    openAIClient: OpenAIClient;
    initialState: webviewApi.Conversation["state"];
  }) {
    this.id = id;
    this.openAIClient = openAIClient;
    this.state = initialState;
    this.messages = [];
  }

  abstract answer(): Promise<void>;

  abstract getTrigger(): webviewApi.Conversation["trigger"];

  addUserMessage({
    content,
    botAction,
  }: {
    content: string;
    botAction?: string;
  }) {
    this.messages.push({ author: "user", content });
    this.state = { type: "waitingForBotAnswer", botAction };
  }

  addBotMessage({
    content,
    responsePlaceholder,
  }: {
    content: string;
    responsePlaceholder?: string;
  }) {
    this.messages.push({ author: "bot", content });
    this.state = { type: "userCanReply", responsePlaceholder };
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
