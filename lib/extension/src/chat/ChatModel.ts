import { ConversationModel } from "./ConversationModel";

export class ChatModel {
  conversations: Array<ConversationModel> = [];
  selectedConversationId: string | undefined;

  addAndSelectConversation(conversation: ConversationModel) {
    this.conversations.push(conversation);
    this.selectedConversationId = conversation.id;
  }

  getConversationById(id: string): ConversationModel | undefined {
    return this.conversations.find((conversation) => conversation.id === id);
  }
}
