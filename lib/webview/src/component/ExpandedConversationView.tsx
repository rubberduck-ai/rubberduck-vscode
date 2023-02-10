import { webviewApi } from "@rubberduck/common";
import React from "react";
import ReactMarkdown from "react-markdown";
import { ChatInput } from "./ChatInput";
import { ConversationHeader } from "./ConversationHeader";

export const ExpandedConversationView: React.FC<{
  conversation: webviewApi.Conversation;
  onSendMessage: (message: string) => void;
  onClickRetry: () => void;
  onClickDelete: () => void;
}> = ({ conversation, onSendMessage, onClickRetry, onClickDelete }) => {
  const content = conversation.content;

  if (content.type === "instructionRefinement") {
    return <></>;
  }

  return (
    <div className={`conversation expanded`}>
      <ConversationHeader conversation={conversation} />

      <div className="detail">
        {content.messages.map((message, i) => (
          <div className={`message ${message.author}`} key={i}>
            {message.author === "user" && message.content}
            {message.author === "bot" && (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
        ))}
        {(() => {
          const type = content.state.type;
          switch (type) {
            case "waitingForBotAnswer":
              return (
                <div className="message bot">
                  {content.state.botAction ?? ""}
                  <span className={"in-progress"} />
                </div>
              );
            case "botAnswerStreaming":
              return (
                <div className="message bot">
                  <ReactMarkdown>
                    {content.state.partialAnswer ?? ""}
                  </ReactMarkdown>
                  <span className={"in-progress"} />
                </div>
              );
            case "userCanReply":
              return (
                <ChatInput
                  placeholder={
                    content.state.responsePlaceholder ??
                    content.messages.length > 0
                      ? "Reply…"
                      : "Ask…"
                  }
                  onSend={onSendMessage}
                />
              );
            case "error":
              return (
                <div key={"error"} className={"message bot error"}>
                  <span className={"error-message"}>
                    Error: {content.state.errorMessage}
                  </span>
                  <span className={"error-retry"} onClick={onClickRetry}>
                    <i className="codicon codicon-debug-restart inline" />
                    <span style={{ marginLeft: "5px" }}>Retry</span>
                  </span>
                </div>
              );
            default: {
              const exhaustiveCheck: never = type;
              throw new Error(`unsupported type: ${exhaustiveCheck}`);
            }
          }
        })()}
      </div>

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
