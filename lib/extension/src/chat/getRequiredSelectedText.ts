import * as vscode from "vscode";
import { getActiveEditor } from "../vscode/getActiveEditor";
import { getInput } from "./getInput";

export const getRequiredSelectedText: getInput<{
  selectedText: string;
  range: vscode.Range;
  language: string;
  filename: string;
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
  const language = document.languageId;
  const filename = document.fileName.split("/").pop();

  if (selectedText.trim().length === 0) {
    return {
      result: "unavailable",
      type: "info",
      message: "No selected text.",
    };
  }

  if (filename == undefined) {
    return {
      result: "unavailable",
      type: "info",
      message: "No filename found.",
    };
  }

  return {
    result: "success",
    data: {
      selectedText,
      range,
      language,
      filename,
    },
  };
};
