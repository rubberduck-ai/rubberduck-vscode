import * as vscode from "vscode";

export function getSelectedTextFromActiveEditor() {
  const activeEditor = vscode.window.activeTextEditor;
  const document = activeEditor?.document;
  const range = activeEditor?.selection;
  const selectedText = document?.getText(range);

  return (selectedText?.length ?? 0) > 0 ? selectedText : undefined;
}
