import { Conversation } from "@rubberduck/common";
import React from "react";

export const ConversationHeader: React.FC<{
  conversation: Conversation;
}> = ({ conversation: conversation }) => (
  <div className="header">
    <i className="codicon codicon-book inline" />
    Code explanation ({conversation.trigger.filename}{" "}
    {conversation.trigger.selectionStartLine}:
    {conversation.trigger.selectionEndLine})
  </div>
);
