import * as vscode from "vscode";

export class WebviewContainer {
  private readonly webview: vscode.Webview;

  constructor({ webview }: { webview: vscode.Webview }) {
    this.webview = webview;
    this.update("");
  }

  async update(content: string) {
    this.webview.html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Security-Policy" content="default-src 'none';" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
      ${content}
      </body>
    </html>`;
  }
}
