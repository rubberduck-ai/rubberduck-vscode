import { webviewApi } from "@rubberduck/common";
import React from "react";

export const ConversationHeader: React.FC<{
  conversation: webviewApi.Conversation;
}> = ({ conversation }) => (
  <div className="header">
    <i className={`codicon codicon-${conversation.header.codicon} inline`} />
    {conversation.header.isTitleMessage ? (
      <span className="message user">{conversation.header.title}</span>
    ) : (
      conversation.header.title
    )}
  </div>
);
