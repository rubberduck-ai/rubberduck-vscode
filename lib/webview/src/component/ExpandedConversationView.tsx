import { webviewApi } from "@rubberduck/common";
import React from "react";
import { ChatInput } from "./ChatInput";
import { ConversationHeader } from "./ConversationHeader";
import { MessageExchange } from "./MessageExchange";

export const ExpandedConversationView: React.FC<{
  conversation: webviewApi.Conversation;
  onSendMessage: (message: string) => void;
  onClickRetry: () => void;
  onClickDelete: () => void;
}> = ({ conversation, onSendMessage, onClickRetry, onClickDelete }) => {
  const content = conversation.content;

  if (content.type === "instructionRefinement") {
    return (
      <ChatInput
        content={content.instruction}
        placeholder={"..."}
        onSend={onSendMessage}
      />
    );
  }

  return (
    <div className={`conversation expanded`}>
      <ConversationHeader conversation={conversation} />

      <MessageExchange
        content={content}
        onClickRetry={onClickRetry}
        onSendMessage={onSendMessage}
      />

      <div className="footer">
        <span className="action-panel">
          <i
            className="codicon codicon-trash inline action-delete"
            onClick={onClickDelete}
          />
        </span>
      </div>
    </div>
  );
};
