import { util, webviewApi } from "@rubberduck/common";
import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
import { ChatConversationModel } from "./ChatConversationModel";
import { ChatModel } from "./ChatModel";
import { ChatPanel } from "./ChatPanel";
import { ConversationModel } from "./ConversationModel";
import { ConversationModelFactory } from "./ConversationModelFactory";

export class ChatController {
  private readonly chatPanel: ChatPanel;
  private readonly chatModel: ChatModel;
  private readonly openAIClient: OpenAIClient;
  private readonly conversationTypes: Record<string, ConversationModelFactory>;
  private readonly extensionUri: vscode.Uri;

  private readonly generateConversationId: () => string;

  constructor({
    chatPanel,
    chatModel,
    openAIClient,
    conversationTypes,
    extensionUri,
  }: {
    chatPanel: ChatPanel;
    chatModel: ChatModel;
    openAIClient: OpenAIClient;
    conversationTypes: Record<string, ConversationModelFactory>;
    extensionUri: vscode.Uri;
  }) {
    this.chatPanel = chatPanel;
    this.chatModel = chatModel;
    this.openAIClient = openAIClient;
    this.conversationTypes = conversationTypes;
    this.extensionUri = extensionUri;

    this.generateConversationId = util.createNextId({
      prefix: "conversation-",
    });
  }

  private async updateChatPanel() {
    await this.chatPanel.update(this.chatModel);
  }

  private async addAndShowConversation<T extends ConversationModel>(
    conversation: T
  ): Promise<T> {
    this.chatModel.addAndSelectConversation(conversation);

    await this.showChatPanel();
    await this.updateChatPanel();

    return conversation;
  }

  private async showChatPanel() {
    await vscode.commands.executeCommand("rubberduck.chat.focus");
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
        await this.chatModel.conversations[message.data.index].answer(
          message.data.message
        );
        break;
      }
      case "startChat": {
        await this.createConversation(ChatConversationModel.id);
        break;
      }
      case "retry": {
        await this.chatModel.conversations[message.data.index].retry();
        break;
      }
      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`unsupported type: ${exhaustiveCheck}`);
      }
    }
  }

  async createConversation(conversationTypeId: string) {
    const factory = this.conversationTypes[conversationTypeId];

    if (factory == undefined) {
      await vscode.window.showErrorMessage(
        `No conversation type found for ${conversationTypeId}`
      );

      return;
    }

    const result = await factory.createConversationModel({
      generateChatId: this.generateConversationId,
      openAIClient: this.openAIClient,
      updateChatPanel: this.updateChatPanel.bind(this),
      extensionUri: this.extensionUri,
    });

    if (result.result === "unavailable") {
      return;
    }

    await this.addAndShowConversation(result.conversation);

    if (result.shouldImmediatelyAnswer) {
      await result.conversation.answer();
    }
  }
}
