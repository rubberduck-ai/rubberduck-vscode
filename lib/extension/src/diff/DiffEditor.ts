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
      panelId: "diff",
      isStateReloadingEnabled: true,
      webview: panel.webview,
      extensionUri,
    });
  }

  async updateDiff({
    originalContent,
    newContent,
  }: {
    originalContent: string;
    newContent: string;
  }) {
    await this.container.updateState({
      type: "diff",
      originalContent,
      newContent,
    });
  }
}
