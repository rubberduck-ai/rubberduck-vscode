import * as vscode from "vscode";
import { getActiveEditor } from "../../vscode/getActiveEditor";
import { getInput } from "./getInput";

export const getSelectedRange: getInput<
  vscode.Selection | undefined
> = async () => ({
  result: "success",
  data: getActiveEditor()?.selection,
});
