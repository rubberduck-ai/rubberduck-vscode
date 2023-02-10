import { webviewApi } from "@rubberduck/common";
import React from "react";
import { ConversationHeader } from "./ConversationHeader";
import { InstructionRefinementView } from "./InstructionRefinementView";
import { MessageExchange } from "./MessageExchange";

export const ExpandedConversationView: React.FC<{
  conversation: webviewApi.Conversation;
  onSendMessage: (message: string) => void;
  onClickRetry: () => void;
  onClickDelete: () => void;
}> = ({ conversation, onSendMessage, onClickRetry, onClickDelete }) => {
  const content = conversation.content;

  return (
    <div className={`conversation expanded`}>
      <ConversationHeader conversation={conversation} />

      {(() => {
        const type = content.type;
        switch (type) {
          case "messageExchange":
            return (
              <MessageExchange
                content={content}
                onClickRetry={onClickRetry}
                onSendMessage={onSendMessage}
              />
            );
          case "instructionRefinement":
            return (
              <InstructionRefinementView
                content={content}
                onSendMessage={onSendMessage}
              />
            );
          default: {
            const exhaustiveCheck: never = type;
            throw new Error(`unsupported type: ${exhaustiveCheck}`);
          }
        }
      })()}

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
