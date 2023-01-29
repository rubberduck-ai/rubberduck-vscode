import { webviewApi } from "@rubberduck/common";
import React from "react";
import { DiffView } from "../component/DiffView";
import { SendMessage } from "../vscode/SendMessage";

export const DiffPanelView: React.FC<{
  sendMessage: SendMessage;
  panelState: webviewApi.PanelState & {
    type: "diff";
  };
}> = ({ panelState, sendMessage }) => (
  <div>
    <DiffView diff={panelState.diff} />
  </div>
);
