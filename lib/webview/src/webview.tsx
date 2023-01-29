import { webviewApi } from "@rubberduck/common";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { ChatPanelView } from "./panel/ChatPanelView";
import { DiffPanelView } from "./panel/DiffPanelView";
import { sendMessage } from "./vscode/SendMessage";
import * as StateManager from "./vscode/StateManager";

const rootElement = document.getElementById("root");

if (rootElement != undefined) {
  const reactRoot = createRoot(rootElement);

  const render = (panelState?: webviewApi.PanelState) => {
    try {
      reactRoot?.render(
        <React.StrictMode>
          {(() => {
            switch (panelState?.type) {
              case "chat":
                return (
                  <ChatPanelView
                    sendMessage={sendMessage}
                    panelState={panelState}
                  />
                );
              case "diff":
                return (
                  <DiffPanelView
                    sendMessage={sendMessage}
                    panelState={panelState}
                  />
                );
              default:
                return <div />;
            }
          })()}
        </React.StrictMode>
      );
    } catch (error) {
      console.error(error);
    }
  };

  render(StateManager.getState());
  StateManager.registerUpdateListener(render);
}
