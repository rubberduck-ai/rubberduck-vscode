import { webviewApi } from "@rubberduck/common";
import React from "react";
import { ConversationHeader } from "./ConversationHeader";
import { InstructionRefinementView } from "./InstructionRefinementView";
import { MessageExchangeView } from "./MessageExchangeView";

export const ExpandedConversationView: React.FC<{
  conversation: webviewApi.Conversation;
  onSendMessage: (message: string) => void;
  onClickDismiss: () => void;
  onClickRetry: () => void;
  onClickDelete: () => void;
  onClickExport: () => void;
}> = ({
  conversation,
  onSendMessage,
  onClickDismiss,
  onClickRetry,
  onClickDelete,
  onClickExport,
}) => {
  const content = conversation.content;

  return (
    <div className={`conversation expanded`}>
      <ConversationHeader conversation={conversation} />

      {(() => {
        const type = content.type;
        switch (type) {
          case "messageExchange":
            return (
              <MessageExchangeView
                content={content}
                onSendMessage={onSendMessage}
                onClickDismiss={onClickDismiss}
                onClickRetry={onClickRetry}
              />
            );
          case "instructionRefinement":
            return (
              <InstructionRefinementView
                content={content}
                onSendMessage={onSendMessage}
                onClickDismiss={onClickDismiss}
                onClickRetry={onClickRetry}
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
            className="codicon codicon-save inline action-export"
            title="Export conversation"
            onClick={onClickExport}
          />
          <i
            className="codicon codicon-trash inline action-delete"
            title="Delete conversation"
            onClick={onClickDelete}
          />
        </span>
      </div>
    </div>
  );
};
