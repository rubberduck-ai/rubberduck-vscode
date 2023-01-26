/*
 * Copyright P42 Software UG (haftungsbeschränkt). All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import * as vscode from "vscode";
import { WebviewContainer } from "../webview/WebviewContainer";

export class ChatPanel implements vscode.WebviewViewProvider {
  public static readonly id = "rubberduck.chat";

  private readonly disposables: vscode.Disposable[] = [];

  private messageEmitter = new vscode.EventEmitter<unknown>();

  readonly onDidReceiveMessage = this.messageEmitter.event;

  private readonly extensionUri: vscode.Uri;

  private webviewPanel: WebviewContainer | undefined;

  private content: string | undefined;

  constructor({ extensionUri }: { readonly extensionUri: vscode.Uri }) {
    this.extensionUri = extensionUri;
  }

  private async renderPanel() {
    return this.webviewPanel?.updateState(this.content);
  }

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ) {
    this.webviewPanel = new WebviewContainer({
      panel: "chat",
      webview: webviewView.webview,
      extensionUri: this.extensionUri,
    });

    this.disposables.push(
      webviewView.onDidChangeVisibility(async () => {
        if (webviewView.visible) {
          return this.renderPanel();
        }
      })
    );

    // not using await here, to avoid having an infinite load-in-progress indicator
    this.renderPanel();
  }

  async update(content: string) {
    this.content = content;
    return this.renderPanel();
  }

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
