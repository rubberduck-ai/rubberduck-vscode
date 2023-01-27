import { Conversation } from "@rubberduck/common";

export class ChatModel {
  conversations: Array<Conversation> = [];
  selectedConversationIndex: number | undefined;

  addAndSelectConversation(conversation: Conversation) {
    this.conversations.push(conversation);
    this.selectedConversationIndex = this.conversations.length - 1;
  }
}
