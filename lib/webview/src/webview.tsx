import * as React from "react";
import { createRoot } from "react-dom/client";

import * as StateManager from "./vscode/StateManager";

const rootElement = document.getElementById("root");

if (rootElement != undefined) {
  const reactRoot = createRoot(rootElement);

  function render(state?: any | undefined) {
    try {
      reactRoot.render(<React.StrictMode>{state}</React.StrictMode>);
    } catch (error) {
      console.error(error);
    }
  }

  StateManager.registerUpdateListener(render);

  render();
}
