import * as vscode from "vscode";
import { DiffEditor } from "./DiffEditor";

export class DiffEditorManager {
  private extensionUri: vscode.Uri;

  constructor({ extensionUri }: { extensionUri: vscode.Uri }) {
    this.extensionUri = extensionUri;
  }

  async createDiffEditor({
    filename,
    editorColumn,
  }: {
    filename: string;
    editorColumn: vscode.ViewColumn;
  }) {
    return new DiffEditor({
      filename,
      editorColumn,
      extensionUri: this.extensionUri,
    });
  }
}
