import Handlebars from "handlebars";
import { OpenAIClient } from "../../openai/OpenAIClient";
import { Conversation } from "../Conversation";
import {
  ConversationType,
  CreateConversationResult,
} from "../ConversationType";
import { resolveVariables } from "../input/resolveVariables";
import { ConversationTemplate } from "./ConversationTemplate";

Handlebars.registerHelper({
  eq: (v1, v2) => v1 === v2,
  neq: (v1, v2) => v1 !== v2,
  lt: (v1, v2) => v1 < v2,
  gt: (v1, v2) => v1 > v2,
  lte: (v1, v2) => v1 <= v2,
  gte: (v1, v2) => v1 >= v2,
});

export class TemplateConversationType implements ConversationType {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly source: ConversationType["source"];
  readonly variables: ConversationTemplate["variables"];

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
    this.variables = template.variables;
  }

  async createConversation({
    conversationId,
    openAIClient,
    updateChatPanel,
    initVariables,
  }: {
    conversationId: string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
    initVariables: Record<string, unknown>;
  }): Promise<CreateConversationResult> {
    return {
      type: "success",
      conversation: new TemplateConversation({
        id: conversationId,
        initVariables,
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
    initVariables,
    openAIClient,
    updateChatPanel,
    template,
  }: {
    id: string;
    initVariables: Record<string, unknown>;
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
              botAction: template.analysis.placeholder ?? "Answering",
            },
      openAIClient,
      updateChatPanel,
      initVariables,
    });

    this.template = template;
  }

  async getTitle() {
    const header = this.template.header;

    try {
      const firstMessageContent = this.messages[0]?.content;

      if (
        header.useFirstMessageAsTitle === true &&
        firstMessageContent != null
      ) {
        return firstMessageContent;
      }

      return await this.evaluateTemplate(header.title);
    } catch (error: unknown) {
      console.error(error);
      return header.title; // not evaluated
    }
  }

  isTitleMessage(): boolean {
    return this.template.header.useFirstMessageAsTitle ?? false
      ? this.messages.length > 0
      : false;
  }

  getCodicon(): string {
    return this.template.header.icon.value;
  }

  private async evaluateTemplate(template: string): Promise<string> {
    const variables = await resolveVariables(this.template.variables, {
      time: "message",
      messages: this.messages,
    });

    return Handlebars.compile(template, {
      noEscape: true,
    })({
      ...variables,
      ...this.initVariables,
    });
  }

  private async executeChat() {
    try {
      const prompt =
        this.template.type === "basic-chat"
          ? this.template.chat.prompt
          : this.messages[0] == null
          ? this.template.analysis.prompt
          : this.template.chat.prompt;

      const completion = await this.openAIClient.generateCompletion({
        prompt: await this.evaluateTemplate(prompt.template),
        maxTokens: prompt.maxTokens,
        stop: prompt.stop,
        temperature: prompt.temperature,
      });

      if (completion.type === "error") {
        await this.setErrorStatus({ errorMessage: completion.errorMessage });
        return;
      }

      await this.addBotMessage({
        content: completion.content.trim(),
      });
    } catch (error: any) {
      console.log(error);
      await this.setErrorStatus({
        errorMessage: error?.message ?? "Unknown error",
      });
    }
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
