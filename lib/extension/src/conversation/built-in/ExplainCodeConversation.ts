import * as vscode from "vscode";
import { OpenAIClient } from "../../openai/OpenAIClient";
import { CodeSection } from "../../prompt/CodeSection";
import { LinesSection } from "../../prompt/LinesSection";
import { Conversation } from "../Conversation";
import { CreateConversationResult } from "../ConversationType";
import { getFileInformation } from "../input/getFileInformation";
import { getRequiredSelectedText } from "../input/getRequiredSelectedText";
import { generateChatCompletion } from "./generateChatCompletion";
import { generateExplainCodeCompletion } from "./generateExplainCodeCompletion";

export class ExplainCodeConversation extends Conversation {
  static id = "explainCode";
  static label = "Explain Code";
  static source = "built-in" as const;
  static inputs = [];

  static async createConversation({
    conversationId,
    openAIClient,
    updateChatPanel,
  }: {
    conversationId: string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
  }): Promise<CreateConversationResult> {
    const result = await getRequiredSelectedText();
    const result2 = await getFileInformation();

    if (result.result === "unavailable") {
      return result;
    }
    if (result2.result === "unavailable") {
      return result2;
    }

    const { selectedText, range } = result.data;
    const { filename } = result2.data;

    return {
      result: "success",
      conversation: new ExplainCodeConversation(
        {
          id: conversationId,
          filename,
          range,
          selectedText,
        },
        {
          openAIClient,
          updateChatPanel,
        }
      ),
      shouldImmediatelyAnswer: true,
    };
  }

  readonly filename: string;
  readonly range: vscode.Range;
  readonly selectedText: string;

  constructor(
    {
      id,
      filename,
      range,
      selectedText,
    }: {
      id: string;
      filename: string;
      range: vscode.Range;
      selectedText: string;
    },
    {
      openAIClient,
      updateChatPanel,
    }: {
      openAIClient: OpenAIClient;
      updateChatPanel: () => Promise<void>;
    }
  ) {
    super({
      id,
      initialState: {
        type: "waitingForBotAnswer",
        botAction: "Generating explanation",
      },
      openAIClient,
      updateChatPanel,
      initData: new Map(),
    });

    this.filename = filename;
    this.range = range;
    this.selectedText = selectedText;
  }

  getTitle(): string {
    return `Explain Code (${this.filename} ${this.range.start.line}:${this.range.end.line})`;
  }

  isTitleMessage(): boolean {
    return false;
  }

  getCodicon(): string {
    return "book";
  }

  private async executeExplainCode() {
    const firstMessage = this.messages[0];

    const completion =
      firstMessage == undefined
        ? await generateExplainCodeCompletion({
            selectedText: this.selectedText,
            openAIClient: this.openAIClient,
          })
        : await generateChatCompletion({
            introSections: [
              new CodeSection({
                code: this.selectedText,
              }),
              new LinesSection({
                title: "Code Summary",
                lines: [firstMessage.content],
              }),
            ],
            messages: this.messages.slice(1),
            openAIClient: this.openAIClient,
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

    await this.executeExplainCode();
  }

  async answer(userMessage?: string) {
    if (userMessage != undefined) {
      await this.addUserMessage({ content: userMessage });
    }

    await this.executeExplainCode();
  }
}
