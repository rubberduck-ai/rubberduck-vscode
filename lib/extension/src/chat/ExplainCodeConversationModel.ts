import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
import { CodeSection } from "../prompt/CodeSection";
import { LinesSection } from "../prompt/LinesSection";
import { getActiveEditorSelectionInput } from "../vscode/getActiveEditorSelectionInput";
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
    const input = getActiveEditorSelectionInput();

    if (input == undefined) {
      return {
        result: "unavailable",
      };
    }

    return {
      result: "success",
      conversation: new ExplainCodeConversationModel(
        {
          id: generateChatId(),
          filename: input.filename,
          range: input.range,
          selectedText: input.selectedText,
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

  getTrigger() {
    return {
      type: "explainCode",
      selection: {
        filename: this.filename,
        startLine: this.range.start.line,
        endLine: this.range.end.line,
        text: this.selectedText,
      },
    } as const;
  }

  private async executeExplainCode() {
    const completion =
      this.messages.length === 0
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
                lines: [this.messages[0].content],
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
      content: completion.content,
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
