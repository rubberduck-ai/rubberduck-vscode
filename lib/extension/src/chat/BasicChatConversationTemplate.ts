import { OpenAIClient } from "../openai/OpenAIClient";
import { CodeSection } from "../prompt/CodeSection";
import { ConversationSection } from "../prompt/ConversationSection";
import { LinesSection } from "../prompt/LinesSection";
import { assemblePrompt } from "../prompt/Prompt";
import { ConversationModel } from "./ConversationModel";
import {
  ConversationModelFactory,
  ConversationModelFactoryResult,
} from "./ConversationModelFactory";

export class BasicChatConversationTemplate implements ConversationModelFactory {
  id = "chat";

  inputs = ["optionalSelectedText"];

  async createConversationModel({
    generateChatId,
    openAIClient,
    updateChatPanel,
    initData,
  }: {
    generateChatId: () => string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
    initData: Map<string, unknown>;
  }): Promise<ConversationModelFactoryResult> {
    return {
      result: "success",
      conversation: new BasicChatConversation({
        id: generateChatId(),
        initData,
        openAIClient,
        updateChatPanel,
      }),
      shouldImmediatelyAnswer: false,
    };
  }
}

class BasicChatConversation extends ConversationModel {
  constructor({
    id,
    initData,
    openAIClient,
    updateChatPanel,
  }: {
    id: string;
    initData: Map<string, unknown>;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
  }) {
    super({
      id,
      initialState: { type: "userCanReply" },
      openAIClient,
      updateChatPanel,
      initData,
    });
  }

  getTitle(): string {
    return this.messages[0]?.content ?? "New Chat";
  }

  isTitleMessage(): boolean {
    return this.messages.length > 0;
  }

  getCodicon(): string {
    return "comment-discussion";
  }

  private async executeChat() {
    const selectedText = this.initData.get("optionalSelectedText") as
      | string
      | undefined;

    const botRole = "Bot";
    const userRole = "Developer";

    const lastMessage = this.messages[this.messages.length - 1];

    const completion = await this.openAIClient.generateCompletion({
      prompt: assemblePrompt({
        sections: [
          new LinesSection({
            title: "Instructions",
            lines: [
              "Continue the conversation below.",
              `Pay special attention to the current ${userRole} request.`,
            ],
          }),
          new LinesSection({
            title: "Current request",
            lines: [`${userRole}: ${lastMessage}`],
          }),
          ...(selectedText != null
            ? [
                new CodeSection({
                  title: "Selected Code",
                  code: selectedText,
                }),
              ]
            : []),
          new ConversationSection({
            messages: this.messages,
            roles: {
              bot: botRole,
              user: userRole,
            },
          }),
          new LinesSection({
            title: "Task",
            lines: [
              "Write a response that continues the conversation.",
              `Stay focused on current ${userRole} request.`,
              "Consider the possibility that there might not be a solution.",
              "Ask for clarification if the message does not make sense or more input is needed.",
              "Use the style of a documentation article.",
              "Omit any links.",
              "Include code snippets (using Markdown) and examples where appropriate.",
            ],
          }),
          new LinesSection({
            title: "Response",
            lines: [`${botRole}:`],
          }),
        ],
      }),
      maxTokens: 1024,
      stop: [`${botRole}:`, `${userRole}:`],
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
