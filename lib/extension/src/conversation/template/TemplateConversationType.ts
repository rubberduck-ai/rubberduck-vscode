import { OpenAIClient } from "../../openai/OpenAIClient";
import { CodeSection } from "../../prompt/CodeSection";
import { ConversationSection } from "../../prompt/ConversationSection";
import { LinesSection } from "../../prompt/LinesSection";
import { assemblePrompt } from "../../prompt/Prompt";
import { Section } from "../../prompt/Section";
import { Conversation } from "../Conversation";
import {
  ConversationType,
  CreateConversationResult,
} from "../ConversationType";
import { ConversationTemplate } from "./ConversationTemplate";

export class TemplateConversationType implements ConversationType {
  readonly id: string;
  readonly inputs = ["optionalSelectedText"];

  private template: ConversationTemplate;

  constructor({ template }: { template: ConversationTemplate }) {
    this.template = template;
    this.id = template.id;
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
      shouldImmediatelyAnswer: false,
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
      initialState: { type: "userCanReply" },
      openAIClient,
      updateChatPanel,
      initData,
    });

    this.template = template;
  }

  getTitle(): string {
    return this.messages[0]?.content ?? "New Chat";
  }

  isTitleMessage(): boolean {
    return this.messages.length > 0;
  }

  getCodicon(): string {
    return this.template.codicon;
  }

  private async executeChat() {
    const { selectedText } = this.initData.get("optionalSelectedText") as {
      selectedText: string | undefined;
    };

    const lastMessage = this.messages[this.messages.length - 1];

    const variables = new Map<string, string | undefined>();
    variables.set("selectedText", selectedText);
    variables.set("lastMessage", lastMessage?.content);

    const prompt = this.template.prompt;

    const completion = await this.openAIClient.generateCompletion({
      prompt: assemblePrompt({
        sections: prompt.sections
          .map((section) => {
            const type = section.type;
            switch (type) {
              case "lines": {
                return new LinesSection({
                  title: section.title,
                  lines: section.lines.map((line) => {
                    // replace ${variable} with the value of the variable:
                    return line.replace(
                      /\$\{([^}]+)\}/g,
                      (_, variable) => variables.get(variable) ?? ""
                    );
                  }),
                });
              }
              case "conversation": {
                return new ConversationSection({
                  messages: this.messages,
                  roles: {
                    bot: section.roles.bot,
                    user: section.roles.user,
                  },
                });
              }
              case "optional-selected-code": {
                return selectedText != null
                  ? new CodeSection({
                      title: "Selected Code",
                      code: selectedText,
                    })
                  : undefined;
              }
              default: {
                const exhaustiveCheck: never = type;
                throw new Error(`unsupported type: ${exhaustiveCheck}`);
              }
            }
          })
          .filter((section) => section != undefined) as Array<Section>,
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
