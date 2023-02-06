import * as vscode from "vscode";
import { WebviewContainer } from "../webview/WebviewContainer";

export class DiffEditor {
  private container: WebviewContainer;

  private messageEmitter = new vscode.EventEmitter<unknown>();

  readonly onDidReceiveMessage = this.messageEmitter.event;

  constructor({
    filename,
    editorColumn,
    extensionUri,
    conversationId,
  }: {
    filename: string;
    editorColumn: vscode.ViewColumn;
    extensionUri: vscode.Uri;
    conversationId: string;
  }) {
    const panel = vscode.window.createWebviewPanel(
      `rubberduck.diff.${conversationId}`,
      `Edit (${filename})`,
      editorColumn
    );

    this.container = new WebviewContainer({
      panelId: "diff",
      isStateReloadingEnabled: true,
      webview: panel.webview,
      extensionUri,
    });

    this.container.onDidReceiveMessage((message: unknown) => {
      this.messageEmitter.fire(message);
    });
  }

  async updateDiff({ oldCode, newCode }: { oldCode: string; newCode: string }) {
    await this.container.updateState({
      type: "diff",
      oldCode,
      newCode,
    });
  }
}
