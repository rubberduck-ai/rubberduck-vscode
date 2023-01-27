import { PanelState } from "@rubberduck/common";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { CollapsedConversationView } from "./component/CollapsedConversationView";
import { ExpandedConversationView } from "./component/ExpandedConversationView";
import { sendMessage } from "./vscode/SendMessage";
import * as StateManager from "./vscode/StateManager";

const rootElement = document.getElementById("root");

if (rootElement != undefined) {
  const reactRoot = createRoot(rootElement);

  function render(panelState?: PanelState | undefined) {
    try {
      reactRoot.render(
        <React.StrictMode>
          {panelState && (
            <div>
              {panelState.conversations.map((conversation, i) =>
                panelState.selectedConversationIndex === i ? (
                  <ExpandedConversationView
                    conversation={conversation}
                    onSendMessage={(message: string) =>
                      sendMessage({
                        type: "sendMessage",
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
          )}
        </React.StrictMode>
      );
    } catch (error) {
      console.error(error);
    }
  }

  StateManager.registerUpdateListener(render);

  render();
}
