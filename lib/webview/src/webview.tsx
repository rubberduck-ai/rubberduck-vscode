import { PanelState } from "@rubberduck/common";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { ChatPanel } from "./panel/ChatPanel";
import { sendMessage } from "./vscode/SendMessage";
import * as StateManager from "./vscode/StateManager";

const rootElement = document.getElementById("root");

if (rootElement != undefined) {
  const reactRoot = createRoot(rootElement);

  function render(panelState?: PanelState | undefined) {
    try {
      reactRoot.render(
        <React.StrictMode>
          <ChatPanel sendMessage={sendMessage} panelState={panelState} />
        </React.StrictMode>
      );
    } catch (error) {
      console.error(error);
    }
  }

  StateManager.registerUpdateListener(render);

  render();
}
