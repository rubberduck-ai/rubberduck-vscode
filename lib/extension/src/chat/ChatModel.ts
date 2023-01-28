import { ConversationModel } from "./ConversationModel";

export class ChatModel {
  conversations: Array<ConversationModel> = [];
  selectedConversationIndex: number | undefined;

  addAndSelectConversation(conversation: ConversationModel) {
    this.conversations.push(conversation);
    this.selectedConversationIndex = this.conversations.length - 1;
  }
}
