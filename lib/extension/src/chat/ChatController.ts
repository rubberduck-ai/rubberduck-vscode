import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
import { BasicSection } from "../prompt/BasicSection";
import { CodeSection } from "../prompt/CodeSection";
import { LinesSection } from "../prompt/LinesSection";
import { assemblePrompt } from "../prompt/Prompt";
import { ChatModel } from "./ChatModel";
import { ChatPanel } from "./ChatPanel";

export class ChatController {
  private readonly chatPanel: ChatPanel;
  private readonly chatModel: ChatModel;
  private readonly openAIClient: OpenAIClient;

  constructor({
    chatPanel,
    chatModel,
    openAIClient,
  }: {
    chatPanel: ChatPanel;
    chatModel: ChatModel;
    openAIClient: OpenAIClient;
  }) {
    this.chatPanel = chatPanel;
    this.chatModel = chatModel;
    this.openAIClient = openAIClient;
  }

  private async updateChatPanel() {
    await this.chatPanel.update(this.chatModel);
  }

  private async getActiveEditorSelectionInput() {
    const activeEditor = vscode.window.activeTextEditor;
    const document = activeEditor?.document;
    const range = activeEditor?.selection;

    if (range == null || document == null) {
      return undefined;
    }

    const selectedText = document.getText(range);

    if (selectedText.length === 0) {
      return undefined;
    }

    return {
      filename: document.fileName.split("/").pop()!,
      range,
      selectedText,
    };
  }

  async receivePanelMessage(message: any) {
    switch (message.type) {
      case "clickCollapsedExplanation":
        this.chatModel.selectedExplanationIndex = message.data.index;
        await this.updateChatPanel();
        break;
    }
  }

  async writeTest() {
    const input = await this.getActiveEditorSelectionInput();

    if (input == null) {
      return;
    }

    const test = (
      await this.openAIClient.generateCompletion({
        prompt: assemblePrompt({
          sections: [
            new LinesSection({
              title: "Goal",
              lines: ["Write a unit test for the code below."],
            }),
            new CodeSection({
              code: input.selectedText,
            }),
            new LinesSection({
              title: "Task",
              lines: [
                "Write a unit test that contains test cases for the happy path and for all edge cases.",
              ],
            }),
            new LinesSection({
              title: "Answer",
              lines: ["```"],
            }),
          ],
        }),
        maxTokens: 2048,
        stop: ["```"],
      })
    ).trim();

    await vscode.window.showTextDocument(
      await vscode.workspace.openTextDocument({
        content: test,
      }),
      vscode.ViewColumn.Beside
    );
  }

  async explainCode() {
    const input = await this.getActiveEditorSelectionInput();

    if (input == null) {
      return;
    }

    await vscode.commands.executeCommand("rubberduck.chat.focus");

    const explanation = {
      filename: input.filename,
      content: undefined,
      selectionStartLine: input.range.start.line,
      selectionEndLine: input.range.end.line,
    };

    this.chatModel.explanations.push(explanation);
    this.chatModel.selectedExplanationIndex =
      this.chatModel.explanations.length - 1;

    await this.updateChatPanel();

    explanation.content = await this.openAIClient.generateCompletion({
      prompt: assemblePrompt({
        sections: [
          new LinesSection({
            title: "Goal",
            lines: [
              "Summarize the code below (emphasizing its key functionality).",
            ],
          }),
          new CodeSection({
            code: input.selectedText,
          }),
          new LinesSection({
            title: "Task",
            lines: [
              "Summarize the code at a high level (including goal and purpose) with an emphasis on its key functionality.",
            ],
          }),
          new BasicSection({
            title: "Answer",
          }),
        ],
      }),
      maxTokens: 512,
    });

    await this.updateChatPanel();
  }
}
