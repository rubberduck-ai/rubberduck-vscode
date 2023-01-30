import { webviewApi } from "@rubberduck/common";
import React, { PureComponent } from "react";
import { SendMessage } from "../vscode/SendMessage";
import ReactDiffViewer from "react-diff-viewer-continued";

class Diff extends PureComponent {
  render = () => {
    return <ReactDiffViewer oldValue={"a"} newValue={"b"} splitView={true} />;
  };
}
export const DiffPanelView: React.FC<{
  sendMessage: SendMessage;
  panelState: webviewApi.PanelState;
}> = ({ panelState, sendMessage }) => {
  if (panelState == null) {
    return <></>;
  }

  if (panelState.type !== "diff") {
    throw new Error(
      `Invalid panel state '${panelState.type}' (expected 'diff'))`
    );
  }

  console.log({
    originalContent: panelState.originalContent,
    newContent: panelState.newContent,
  });

  return <Diff />;
};
