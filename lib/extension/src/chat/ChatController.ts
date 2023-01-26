import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
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

  async receivePanelMessage(message: any) {
    switch (message.type) {
      case "clickCollapsedExplanation":
        this.chatModel.selectedExplanationIndex = message.data.index;
        await this.chatPanel.update(this.chatModel);
        break;
    }
  }

  async explainCode() {
    const activeEditor = vscode.window.activeTextEditor;
    const document = activeEditor?.document;
    const range = activeEditor?.selection;

    if (range == null || document == null) {
      return;
    }

    const selectedText = document.getText(range);

    if (selectedText.length === 0) {
      return;
    }

    await vscode.commands.executeCommand("rubberduck.chat.focus");

    const explanation = {
      filename: document.fileName.split("/").pop()!,
      content: undefined,
      selectionStartLine: range.start.line,
      selectionEndLine: range.end.line,
    };

    this.chatModel.explanations.push(explanation);
    this.chatModel.selectedExplanationIndex =
      this.chatModel.explanations.length - 1;

    await this.chatPanel.update(this.chatModel); // update with loading state

    explanation.content = await this.openAIClient.generateCompletion({
      prompt: `Explain the code below:\n\n ${selectedText}`,
    });

    await this.chatPanel.update(this.chatModel);
  }
}
