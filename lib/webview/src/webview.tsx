import { Explanation, PanelState } from "@rubberduck/common";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { ExplanationView } from "./component/ExplanationView";
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
              {panelState.explanations.map((explanation: Explanation) => (
                <ExplanationView explanation={explanation} />
              ))}
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
