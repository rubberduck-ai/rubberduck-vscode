import { webviewApi } from "@rubberduck/common";

export class ChatModel {
  conversations: Array<webviewApi.Conversation> = [];
  selectedConversationIndex: number | undefined;

  addAndSelectConversation(conversation: webviewApi.Conversation) {
    this.conversations.push(conversation);
    this.selectedConversationIndex = this.conversations.length - 1;
  }
}
