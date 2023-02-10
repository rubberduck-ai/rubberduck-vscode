import { webviewApi } from "@rubberduck/common";
import React from "react";
import ReactMarkdown from "react-markdown";
import { ChatInput } from "./ChatInput";

export function MessageExchangeView({
  content,
  onClickRetry,
  onSendMessage,
}: {
  content: webviewApi.MessageExchangeContent;
  onSendMessage: (message: string) => void;
  onClickRetry: () => void;
}) {
  return (
    <div className="message-exchange">
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
  );
}
