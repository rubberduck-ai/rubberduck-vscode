import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
import { CodeSection } from "../prompt/CodeSection";
import { LinesSection } from "../prompt/LinesSection";
import { getActiveEditor } from "../vscode/getActiveEditor";
import { ConversationModel } from "./ConversationModel";
import { ConversationModelFactoryResult } from "./ConversationModelFactory";
import { generateChatCompletion } from "./generateChatCompletion";
import { generateExplainCodeCompletion } from "./generateExplainCodeCompletion";

export class ExplainCodeConversationModel extends ConversationModel {
  static id = "explainCode";

  static async createConversationModel({
    generateChatId,
    openAIClient,
    updateChatPanel,
  }: {
    generateChatId: () => string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
  }): Promise<ConversationModelFactoryResult> {
    const activeEditor = getActiveEditor();

    if (activeEditor == undefined) {
      return {
        result: "unavailable",
        type: "info",
        message: "No active editor",
      };
    }

    const document = activeEditor.document;
    const range = activeEditor.selection;
    const selectedText = document.getText(range);

    if (selectedText.trim().length === 0) {
      return {
        result: "unavailable",
        type: "info",
        message: "No selected text.",
      };
    }

    return {
      result: "success",
      conversation: new ExplainCodeConversationModel(
        {
          id: generateChatId(),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          filename: document.fileName.split("/").pop()!,
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
