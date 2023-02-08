import * as vscode from "vscode";
import { WebviewContainer } from "../webview/WebviewContainer";

export class DiffEditor {
  private container: WebviewContainer;

  private messageEmitter = new vscode.EventEmitter<unknown>();
  private messageHandler: vscode.Disposable | undefined;

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

  onDidReceiveMessage: vscode.Event<unknown> = (
    listener,
    thisArg,
    disposables
  ) => {
    // We only want to execute the last listener to apply the latest change.
    this.messageHandler?.dispose();
    this.messageHandler = this.messageEmitter.event(
      listener,
      thisArg,
      disposables
    );
    return this.messageHandler;
  };

  async updateDiff({
    oldCode,
    newCode,
    languageId,
  }: {
    oldCode: string;
    newCode: string;
    languageId?: string;
  }) {
    await this.container.updateState({
      type: "diff",
      oldCode,
      newCode,
      languageId,
    });
  }
}
