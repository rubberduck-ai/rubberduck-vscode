import { getActiveEditor } from "../vscode/getActiveEditor";
import { getInput } from "./getInput";

export const getFileInformation: getInput<{
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
  const language = document.languageId;
  const filename = document.fileName.split("/").pop();

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
      language,
      filename,
    },
  };
};
