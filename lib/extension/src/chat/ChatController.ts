import { util, webviewApi } from "@rubberduck/common";
import * as vscode from "vscode";
import { DiffEditorManager } from "../diff/DiffEditorManager";
import { OpenAIClient } from "../openai/OpenAIClient";
import { ChatModel } from "./ChatModel";
import { ChatPanel } from "./ChatPanel";
import { Conversation } from "../conversation/Conversation";
import { ConversationType } from "../conversation/ConversationType";
import { getInput } from "../conversation/input/getInput";
import { getSelectedText } from "../conversation/input/getSelectedText";
import { getFilename } from "../conversation/input/getFilename";
import { getSelectedRange } from "../conversation/input/getSelectedRange";

export class ChatController {
  private readonly chatPanel: ChatPanel;
  private readonly chatModel: ChatModel;
  private readonly openAIClient: OpenAIClient;
  private readonly getConversationType: (
    id: string
  ) => ConversationType | undefined;
  private readonly diffEditorManager: DiffEditorManager;
  private readonly basicChatTemplateId: string;
  private readonly generateConversationId: () => string;

  constructor({
    chatPanel,
    chatModel,
    openAIClient,
    getConversationType,
    diffEditorManager,
    basicChatTemplateId,
  }: {
    chatPanel: ChatPanel;
    chatModel: ChatModel;
    openAIClient: OpenAIClient;
    getConversationType: (id: string) => ConversationType | undefined;
    diffEditorManager: DiffEditorManager;
    basicChatTemplateId: string;
  }) {
    this.chatPanel = chatPanel;
    this.chatModel = chatModel;
    this.openAIClient = openAIClient;
    this.getConversationType = getConversationType;
    this.diffEditorManager = diffEditorManager;
    this.basicChatTemplateId = basicChatTemplateId;

    this.generateConversationId = util.createNextId({
      prefix: "conversation-",
    });
  }

  private async updateChatPanel() {
    await this.chatPanel.update(this.chatModel);
  }

  private async addAndShowConversation<T extends Conversation>(
    conversation: T
  ): Promise<T> {
    this.chatModel.addAndSelectConversation(conversation);

    await this.showChatPanel();
    await this.updateChatPanel();

    return conversation;
  }

  async showChatPanel() {
    await vscode.commands.executeCommand("rubberduck.chat.focus");
  }

  async receivePanelMessage(rawMessage: unknown) {
    const message = webviewApi.outgoingMessageSchema.parse(rawMessage);
    const type = message.type;

    switch (type) {
      case "clickCollapsedConversation": {
        this.chatModel.selectedConversationId = message.data.id;
        await this.updateChatPanel();
        break;
      }
      case "sendMessage": {
        await this.chatModel
          .getConversationById(message.data.id)
          ?.answer(message.data.message);
        break;
      }
      case "startChat": {
        await this.createConversation(this.basicChatTemplateId);
        break;
      }
      case "deleteConversation": {
        this.chatModel.deleteConversation(message.data.id);
        await this.updateChatPanel();
        break;
      }
      case "retry": {
        await this.chatModel.getConversationById(message.data.id)?.retry();
        break;
      }
      case "applyDiff": {
        break;
      }
      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`unsupported type: ${exhaustiveCheck}`);
      }
    }
  }

  async createConversation(conversationTypeId: string) {
    const conversationType = this.getConversationType(conversationTypeId);

    if (conversationType == undefined) {
      await vscode.window.showErrorMessage(
        `No conversation type found for ${conversationTypeId}`
      );

      return;
    }

    const availableInputs: Record<string, getInput<unknown>> = {
      selectedText: getSelectedText,
      filename: getFilename,
      selectedRange: getSelectedRange,
    };

    const initData = new Map<string, unknown>();

    for (const inputKey of conversationType.inputs) {
      const input = availableInputs[inputKey];

      if (input == undefined) {
        await vscode.window.showErrorMessage(
          `No input found for input '${inputKey}'`
        );

        return;
      }

      const initResult = await input();

      if (initResult.type === "unavailable") {
        if (initResult.display === "info") {
          await vscode.window.showInformationMessage(initResult.message);
        } else if (initResult.display === "error") {
          await vscode.window.showErrorMessage(initResult.message);
        }

        return;
      }

      initData.set(inputKey, initResult.data);
    }

    const result = await conversationType.createConversation({
      conversationId: this.generateConversationId(),
      openAIClient: this.openAIClient,
      updateChatPanel: this.updateChatPanel.bind(this),
      diffEditorManager: this.diffEditorManager,
      initData,
    });

    if (result.type === "unavailable") {
      if (result.display === "info") {
        await vscode.window.showInformationMessage(result.message);
      } else if (result.display === "error") {
        await vscode.window.showErrorMessage(result.message);
      }

      return;
    }

    await this.addAndShowConversation(result.conversation);

    if (result.shouldImmediatelyAnswer) {
      await result.conversation.answer();
    }
  }
}
