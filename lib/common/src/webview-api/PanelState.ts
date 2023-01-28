import { Conversation } from "./Conversation";

export type PanelState =
  | {
      conversations: Array<Conversation>;
      selectedConversationIndex: number | undefined;
    }
  | undefined;
