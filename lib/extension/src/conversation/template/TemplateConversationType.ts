import * as vscode from "vscode";
import { OpenAIClient } from "../../openai/OpenAIClient";
import { Conversation } from "../Conversation";
import {
  ConversationType,
  CreateConversationResult,
} from "../ConversationType";
import { ConversationTemplate } from "./ConversationTemplate";
import { createPromptForConversationTemplate } from "./createPromptForConversationTemplate";

export class TemplateConversationType implements ConversationType {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly source: ConversationType["source"];
  readonly inputs = ["optionalSelectedText"];

  private template: ConversationTemplate;

  constructor({
    template,
    source,
  }: {
    template: ConversationTemplate;
    source: ConversationType["source"];
  }) {
    this.template = template;

    this.id = template.id;
    this.label = template.label;
    this.description = template.description;
    this.source = source;
  }

  async createConversation({
    conversationId,
    openAIClient,
    updateChatPanel,
    initData,
  }: {
    conversationId: string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
    initData: Map<string, unknown>;
  }): Promise<CreateConversationResult> {
    return {
      result: "success",
      conversation: new TemplateConversation({
        id: conversationId,
        initData,
        openAIClient,
        updateChatPanel,
        template: this.template,
      }),
      shouldImmediatelyAnswer:
        this.template.type === "selected-code-analysis-chat",
    };
  }
}

class TemplateConversation extends Conversation {
  private readonly template: ConversationTemplate;

  constructor({
    id,
    initData,
    openAIClient,
    updateChatPanel,
    template,
  }: {
    id: string;
    initData: Map<string, unknown>;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
    template: ConversationTemplate;
  }) {
    super({
      id,
      initialState:
        template.type === "basic-chat"
          ? { type: "userCanReply" }
          : {
              type: "waitingForBotAnswer",
              botAction: template.analysisPlaceholder ?? "Generating answer",
            },
      openAIClient,
      updateChatPanel,
      initData,
    });

    this.template = template;
  }

  getTitle(): string {
    const filename = this.initData.get("filename") as string;
    const selectedRange = this.initData.get("selectedRange") as vscode.Range;

    return this.template.type === "basic-chat"
      ? this.messages[0]?.content ?? "New Chat"
      : `${this.template.chatTitle} (${filename} ${selectedRange.start.line}:${selectedRange.end.line})`;
  }

  isTitleMessage(): boolean {
    return this.template.type === "basic-chat"
      ? this.messages.length > 0
      : false;
  }

  getCodicon(): string {
    return this.template.codicon;
  }

  private async executeChat() {
    const selectedText = this.initData.get("optionalSelectedText") as
      | string
      | undefined;

    const messages = this.messages;
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];

    const variables = {
      selectedText,
      firstMessage: firstMessage?.content,
      lastMessage: lastMessage?.content,
      messages,
    };

    const prompt =
      this.template.type === "basic-chat"
        ? this.template.prompt
        : firstMessage == null
        ? this.template.analysisPrompt
        : this.template.chatPrompt;

    const completion = await this.openAIClient.generateCompletion({
      prompt: createPromptForConversationTemplate({
        sections: prompt.sections,
        variables,
      }),
      maxTokens: prompt.maxTokens,
      stop: prompt.stop,
    });

    if (completion.type === "error") {
      await this.setErrorStatus({ errorMessage: completion.errorMessage });
      return;
    }

    await this.addBotMessage({
      content: completion.content.trim(),
    });
  }

  async retry() {
    this.state = { type: "waitingForBotAnswer" };
    await this.updateChatPanel();

    await this.executeChat();
  }

  async answer(userMessage?: string) {
    if (userMessage != undefined) {
      await this.addUserMessage({ content: userMessage });
    }

    await this.executeChat();
  }
}
