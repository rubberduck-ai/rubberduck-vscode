import { Message } from "@rubberduck/common/build/webview-api";
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

    const messages = this.messages;
    const lastMessage = messages[messages.length - 1];

    const variables = {
      selectedText,
      lastMessage: lastMessage?.content,
      messages,
    };

    const prompt = this.template.prompt;

    const completion = await this.openAIClient.generateCompletion({
      prompt: createPrompt({ sections: prompt.sections, variables }),
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

function createPrompt({
  sections,
  variables,
}: {
  sections: ConversationTemplate["prompt"]["sections"];
  variables: {
    selectedText: string | undefined;
    lastMessage: string | undefined;
    messages: Message[];
  } & Record<string, unknown>;
}): string {
  const { selectedText, messages } = variables;

  return assemblePrompt({
    sections: sections
      .map((section) => {
        const type = section.type;
        switch (type) {
          case "lines": {
            return new LinesSection({
              title: section.title,
              lines: section.lines.map((line) =>
                // replace ${variable} with the value of the variable:
                line.replace(
                  /\$\{([^}]+)\}/g,
                  (_, variable) => variables[variable]?.toString() ?? ""
                )
              ),
            });
          }
          case "conversation": {
            return new ConversationSection({
              messages,
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
  });
}
