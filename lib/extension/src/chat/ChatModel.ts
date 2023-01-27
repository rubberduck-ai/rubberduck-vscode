import { Conversation } from "@rubberduck/common";

export class ChatModel {
  conversations: Array<Conversation> = [];
  selectedConversationIndex: number | undefined;
}
