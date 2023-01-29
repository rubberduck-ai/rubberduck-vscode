import { webviewApi } from "@rubberduck/common";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ChatPanelView } from "./panel/ChatPanelView";
import { DiffPanelView } from "./panel/DiffPanelView";
import { sendMessage } from "./vscode/SendMessage";

let reactRoot: Root | undefined = undefined;

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

const rootElement = document.getElementById("root");
if (rootElement != undefined) {
  reactRoot = createRoot(rootElement);
  render();
}

window.addEventListener("message", (rawMessage: unknown) => {
  const event = webviewApi.incomingMessageSchema.parse(rawMessage);

  const message = event.data;
  if (message.type === "updateState" && render != null) {
    render(message.state);
  }
});
