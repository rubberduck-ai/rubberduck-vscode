import { util, webviewApi } from "@rubberduck/common";
import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
import { ChatModel } from "./ChatModel";
import { ChatPanel } from "./ChatPanel";
import { ConversationModel } from "./ConversationModel";
import { ExplainCodeConversationModel } from "./ExplainCodeConversationModel";
import { FreeConversationModel } from "./FreeConversationModel";
import { generateGenerateTestCompletion } from "./generateGenerateTestCompletion";

export class ChatController {
  private readonly chatPanel: ChatPanel;
  private readonly chatModel: ChatModel;
  private readonly openAIClient: OpenAIClient;

  private readonly nextChatId: () => string;

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

    this.nextChatId = util.createNextId({ prefix: "chat-" });
  }

  private async updateChatPanel() {
    await this.chatPanel.update(this.chatModel);
  }

  private async addAndShowConversation(conversation: ConversationModel) {
    this.chatModel.addAndSelectConversation(conversation);

    await this.showChatPanel();
    await this.updateChatPanel();

    return conversation;
  }

  private async showChatPanel() {
    await vscode.commands.executeCommand("rubberduck.chat.focus");
  }

  private async getActiveEditorSelectionInput() {
    const activeEditor = vscode.window.activeTextEditor;
    const document = activeEditor?.document;
    const range = activeEditor?.selection;

    if (range == null || document == null) {
      return undefined;
    }

    const selectedText = document.getText(range);
    const filename = document.fileName.split("/").pop();

    if (selectedText.length === 0 || filename == undefined) {
      return undefined;
    }

    return {
      filename,
      range,
      selectedText,
    };
  }

  async receivePanelMessage(rawMessage: unknown) {
    const message = webviewApi.outgoingMessageSchema.parse(rawMessage);
    const type = message.type;

    switch (type) {
      case "clickCollapsedExplanation": {
        this.chatModel.selectedConversationIndex = message.data.index;
        await this.updateChatPanel();
        break;
      }
      case "sendChatMessage": {
        const conversation = this.chatModel.conversations[message.data.index];
        conversation.addUserMessage({ content: message.data.message });
        await this.updateChatPanel();
        await conversation.answer();
        await this.updateChatPanel();
        break;
      }
      case "startChat": {
        await this.startChat();
        break;
      }
      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`unsupported type: ${exhaustiveCheck}`);
      }
    }
  }

  async startChat() {
    await this.addAndShowConversation(
      new FreeConversationModel(
        { id: this.nextChatId() },
        { openAIClient: this.openAIClient }
      )
    );
  }

  async generateTest() {
    const input = await this.getActiveEditorSelectionInput();

    if (input == null) {
      return;
    }

    const test: string = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification },
      async (progress) => {
        progress.report({ message: "Generating test…" });

        return await generateGenerateTestCompletion({
          selectedText: input.selectedText,
          openAIClient: this.openAIClient,
        });
      }
    );

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

    const conversation = await this.addAndShowConversation(
      new ExplainCodeConversationModel(
        {
          id: this.nextChatId(),
          filename: input.filename,
          range: input.range,
          selectedText: input.selectedText,
        },
        { openAIClient: this.openAIClient }
      )
    );

    await conversation.answer();

    await this.updateChatPanel();
  }
}
