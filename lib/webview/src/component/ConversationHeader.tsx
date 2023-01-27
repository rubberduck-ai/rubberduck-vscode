import { Conversation } from "@rubberduck/common";
import React from "react";

export const ConversationHeader: React.FC<{
  conversation: Conversation;
}> = ({ conversation }) => (
  <div className="header">
    {conversation.trigger.type === "explainCode" && (
      <>
        <i className="codicon codicon-book inline" />
        Code explanation ({conversation.trigger.filename}{" "}
        {conversation.trigger.selectionStartLine}:
        {conversation.trigger.selectionEndLine})
      </>
    )}
    {conversation.trigger.type === "startChat" && (
      <>
        <i className="codicon codicon-comment-discussion inline" />
        Chat
      </>
    )}
  </div>
);
