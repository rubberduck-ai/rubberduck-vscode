import * as vscode from "vscode";
import { getSelectedTextFromActiveEditor } from "./getSelectedTextFromActiveEditor";

export function getActiveEditorSelectionInput() {
  const activeEditor = vscode.window.activeTextEditor;
  const document = activeEditor?.document;
  const range = activeEditor?.selection;

  if (range == null || document == null) {
    return undefined;
  }

  const selectedText = getSelectedTextFromActiveEditor();
  const filename = document.fileName.split("/").pop();

  if (selectedText == undefined || filename == undefined) {
    return undefined;
  }

  return {
    filename,
    document,
    range,
    selectedText,
    language: activeEditor?.document.languageId,
  };
}
