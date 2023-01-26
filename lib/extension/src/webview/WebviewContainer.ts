import { PanelState } from "@rubberduck/common";
import * as vscode from "vscode";
import { generateNonce } from "./generateNonce";

export class WebviewContainer {
  private readonly webview: vscode.Webview;
  private readonly panel: string;
  private readonly extensionUri: vscode.Uri;

  readonly onDidReceiveMessage;

  constructor({
    panel,
    webview,
    extensionUri,
  }: {
    panel: string;
    webview: vscode.Webview;
    extensionUri: vscode.Uri;
  }) {
    this.panel = panel;
    this.webview = webview;
    this.extensionUri = extensionUri;

    this.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };
    this.webview.html = this.createHtml();

    this.onDidReceiveMessage = this.webview.onDidReceiveMessage;
  }

  async updateState(state: PanelState) {
    return this.webview.postMessage({
      type: "updateState",
      state,
    });
  }

  private getUri(...paths: string[]) {
    return this.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "webview", ...paths)
    );
  }

  private createHtml() {
    const baseCssUri = this.getUri("asset", "base.css");
    const codiconsCssUri = this.getUri("asset", "codicons.css");
    const webviewCssUri = this.getUri("asset", `${this.panel}.css`);
    const scriptUri = this.getUri("dist", "webview.js");

    // Use a nonce to only allow a specific script to be run.
    const nonce = generateNonce();

    const cspSource = this.webview?.cspSource;

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${cspSource}; style-src ${cspSource}; script-src 'nonce-${nonce}';" />
    <link href="${baseCssUri}" rel="stylesheet" />
    <link href="${codiconsCssUri}" rel="stylesheet" />
    <link href="${webviewCssUri}" rel="stylesheet" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="root" />
    <script nonce="${nonce}" src="${scriptUri}" data-panel="${this.panel}" />
  </body>
</html>`;
  }
}
