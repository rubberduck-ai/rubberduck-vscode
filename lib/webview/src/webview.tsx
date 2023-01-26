import { Explanation } from "@rubberduck/common";
import * as React from "react";
import { createRoot } from "react-dom/client";
import * as StateManager from "./vscode/StateManager";

const rootElement = document.getElementById("root");

if (rootElement != undefined) {
  const reactRoot = createRoot(rootElement);

  function render(state?: Explanation | undefined) {
    try {
      reactRoot.render(
        <React.StrictMode>{state?.explanation}</React.StrictMode>
      );
    } catch (error) {
      console.error(error);
    }
  }

  StateManager.registerUpdateListener(render);

  render();
}
