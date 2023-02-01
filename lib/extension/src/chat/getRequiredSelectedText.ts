import * as vscode from "vscode";
import { getActiveEditor } from "../vscode/getActiveEditor";
import { getInput } from "./getInput";

export const getRequiredSelectedText: getInput<{
  selectedText: string;
  range: vscode.Range;
  document: vscode.TextDocument;
}> = async () => {
  const activeEditor = getActiveEditor();

  if (activeEditor == undefined) {
    return {
      result: "unavailable",
      type: "info",
      message: "No active editor",
    };
  }

  const document = activeEditor.document;
  const range = activeEditor.selection;
  const selectedText = document.getText(range);

  if (selectedText.trim().length === 0) {
    return {
      result: "unavailable",
      type: "info",
      message: "No selected text.",
    };
  }

  return {
    result: "success",
    data: {
      selectedText,
      range,
      document,
    },
  };
};
