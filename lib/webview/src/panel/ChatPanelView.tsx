import { webviewApi } from "@rubberduck/common";
import React from "react";
import { CollapsedConversationView } from "../component/CollapsedConversationView";
import { ExpandedConversationView } from "../component/ExpandedConversationView";
import { SendMessage } from "../vscode/SendMessage";

const StartChatButton: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => (
  <div className="start-chat">
    <button onClick={onClick}>Start new chat</button>
  </div>
);

export const ChatPanelView: React.FC<{
  sendMessage: SendMessage;
  panelState: webviewApi.PanelState;
}> = ({ panelState, sendMessage }) => {
  if (panelState == null) {
    return (
      <StartChatButton onClick={() => sendMessage({ type: "startChat" })} />
    );
  }

  if (panelState.type !== "chat") {
    throw new Error(
      `Invalid panel state '${panelState.type}' (expected 'chat'))`
    );
  }

  return (
    <div>
      {panelState.conversations.map((conversation, i) =>
        panelState.selectedConversationIndex === i ? (
          <ExpandedConversationView
            key={conversation.id}
            conversation={conversation}
            onSendMessage={(message: string) =>
              sendMessage({
                type: "sendChatMessage",
                data: { index: i, message },
              })
            }
            onClickRetry={() =>
              sendMessage({
                type: "retry",
                data: { index: i },
              })
            }
          />
        ) : (
          <CollapsedConversationView
            key={conversation.id}
            conversation={conversation}
            onClick={() =>
              sendMessage({
                type: "clickCollapsedExplanation",
                data: { index: i },
              })
            }
          />
        )
      )}
    </div>
  );
};
