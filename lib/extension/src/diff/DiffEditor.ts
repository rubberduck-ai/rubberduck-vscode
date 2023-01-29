import * as vscode from "vscode";
import { WebviewContainer } from "../webview/WebviewContainer";

export class DiffEditor {
  private container: WebviewContainer;

  constructor({
    filename,
    editorColumn,
    extensionUri,
  }: {
    filename: string;
    editorColumn: vscode.ViewColumn;
    extensionUri: vscode.Uri;
  }) {
    const panel = vscode.window.createWebviewPanel(
      "rubberduck.diff",
      `${filename} (edit)`,
      editorColumn
    );

    this.container = new WebviewContainer({
      panel: "diff",
      webview: panel.webview,
      extensionUri,
    });
  }

  async updateDiff(diff: string) {
    await this.container.updateState({
      type: "diff",
      diff,
    });
  }
}
