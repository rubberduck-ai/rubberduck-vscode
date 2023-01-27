import { Conversation } from "@rubberduck/common";
import React from "react";
import { ConversationHeader } from "./ConversationHeader";

export const CollapsedConversationView: React.FC<{
  conversation: Conversation;
  onClick: () => void;
}> = ({ conversation, onClick }) => (
  <div className={`explanation collapsed`} onClick={onClick}>
    <ConversationHeader conversation={conversation} />
  </div>
);
