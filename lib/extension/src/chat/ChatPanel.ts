import { PanelState } from "@rubberduck/common";
import * as vscode from "vscode";
import { WebviewContainer } from "../webview/WebviewContainer";

export class ChatPanel implements vscode.WebviewViewProvider {
  public static readonly id = "rubberduck.chat";

  private readonly disposables: vscode.Disposable[] = [];

  private messageEmitter = new vscode.EventEmitter<unknown>();

  readonly onDidReceiveMessage = this.messageEmitter.event;

  private readonly extensionUri: vscode.Uri;

  private webviewPanel: WebviewContainer | undefined;

  private state: PanelState | undefined;

  constructor({ extensionUri }: { readonly extensionUri: vscode.Uri }) {
    this.extensionUri = extensionUri;
  }

  private async renderPanel() {
    return this.webviewPanel?.updateState(this.state);
  }

  async resolveWebviewView(webviewView: vscode.WebviewView) {
    this.webviewPanel = new WebviewContainer({
      panel: "chat",
      webview: webviewView.webview,
      extensionUri: this.extensionUri,
    });

    const receiveMessageDisposable = this.webviewPanel.onDidReceiveMessage(
      (message: unknown) => {
        this.messageEmitter.fire(message);
      }
    );

    this.disposables.push(
      webviewView.onDidDispose(() => {
        receiveMessageDisposable.dispose();
        this.webviewPanel = undefined;
      })
    );

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

  async update(state: PanelState) {
    this.state = state;
    return this.renderPanel();
  }

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
