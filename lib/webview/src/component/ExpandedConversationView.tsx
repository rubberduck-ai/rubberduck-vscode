import { webviewApi } from "@rubberduck/common";
import React from "react";
import ReactMarkdown from "react-markdown";
import { ChatInput } from "./ChatInput";
import { ConversationHeader } from "./ConversationHeader";

export const ExpandedConversationView: React.FC<{
  conversation: webviewApi.Conversation;
  onSendMessage: (message: string) => void;
}> = ({ conversation, onSendMessage }) => {
  // The first message of a free chat is shown in the header,
  // so we don't want to show it again in the detail view:
  const messages =
    conversation.trigger.type === "startChat"
      ? conversation.messages.slice(1)
      : conversation.messages;

  return (
    <div className={`conversation expanded`}>
      <ConversationHeader conversation={conversation} />

      <div className="detail">
        {messages.map((message, i) => (
          <div className={`message ${message.author}`} key={i}>
            {message.author === "user" && message.content}
            {message.author === "bot" && (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
        ))}
        {(() => {
          const type = conversation.state.type;
          switch (type) {
            case "waitingForBotAnswer":
              return (
                <div className="message bot">
                  {conversation.state.botAction ?? ""}
                  <span className={"in-progress"} />
                </div>
              );
            case "userCanReply":
              return (
                <ChatInput
                  placeholder={
                    conversation.state.responsePlaceholder ??
                    conversation.messages.length > 0
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
                    Error: {conversation.state.errorMessage}
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
    </div>
  );
};
