import { Conversation } from "@rubberduck/common";
import React from "react";
import { ConversationHeader } from "./ConversationHeader";

export const ExpandedConversationView: React.FC<{
  conversation: Conversation;
}> = ({ conversation }) => (
  <div className={`explanation expanded`}>
    <ConversationHeader conversation={conversation} />

    <div className="detail">
      {conversation.messages.map((message) => message.content)}
      {conversation.state.type === "waitingForBotAnswer" && (
        <div className={"in-progress"} />
      )}
    </div>
  </div>
);
