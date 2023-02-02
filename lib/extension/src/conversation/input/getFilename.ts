import * as vscode from "vscode";
import { getActiveEditor } from "../../vscode/getActiveEditor";
import { getInput } from "./getInput";

export type FileInformationData = {
  language: string;
  filename: string;
  activeEditor: vscode.TextEditor;
};

export const getFilename: getInput<string | undefined> = async () => ({
  result: "success",
  data: getActiveEditor()?.document?.fileName.split("/").pop(),
});
