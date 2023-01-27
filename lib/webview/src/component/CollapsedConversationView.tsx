import { Conversation } from "@rubberduck/common";
import React from "react";
import { ConversationHeader } from "./ConversationHeader";

export const CollapsedConversationView: React.FC<{
  conversation: Conversation;
  onClick: () => void;
}> = ({ conversation, onClick }) => (
  <div className={`conversation collapsed`} onClick={onClick}>
    <ConversationHeader conversation={conversation} />
  </div>
);
