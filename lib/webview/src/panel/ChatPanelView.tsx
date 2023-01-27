import { PanelState } from "@rubberduck/common";
import React from "react";
import { CollapsedConversationView } from "../component/CollapsedConversationView";
import { ExpandedConversationView } from "../component/ExpandedConversationView";
import { SendMessage } from "../vscode/SendMessage";

export const ChatPanelView: React.FC<{
  sendMessage: SendMessage;
  panelState: PanelState;
}> = ({ panelState, sendMessage }) => {
  if (panelState === undefined) {
    return <></>;
  }

  return (
    <div>
      {panelState.conversations.map((conversation, i) =>
        panelState.selectedConversationIndex === i ? (
          <ExpandedConversationView
            conversation={conversation}
            onSendMessage={(message: string) =>
              sendMessage({
                type: "sendChatMessage",
                data: { index: i, message },
              })
            }
          />
        ) : (
          <CollapsedConversationView
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
