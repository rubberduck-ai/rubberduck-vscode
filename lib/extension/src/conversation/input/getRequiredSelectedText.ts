import * as vscode from "vscode";
import { getActiveEditor } from "../../vscode/getActiveEditor";
import { getInput } from "./getInput";

export type RequiredSelectedTextData = {
  selectedText: string;
  range: vscode.Range;
};

export const getRequiredSelectedText: getInput<
  RequiredSelectedTextData
> = async () => {
  const activeEditor = getActiveEditor();

  if (activeEditor == undefined) {
    return {
      type: "unavailable",
      display: "info",
      message: "No active editor",
    };
  }

  const document = activeEditor.document;
  const range = activeEditor.selection;
  const selectedText = document.getText(range);

  if (selectedText.trim().length === 0) {
    return {
      type: "unavailable",
      display: "info",
      message: "No selected text.",
    };
  }

  return {
    type: "success",
    data: {
      selectedText,
      range,
    },
  };
};
