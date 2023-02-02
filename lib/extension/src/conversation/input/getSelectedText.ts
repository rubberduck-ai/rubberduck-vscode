import { getActiveEditor } from "../../vscode/getActiveEditor";
import { getInput } from "./getInput";

export const getSelectedText: getInput<string | undefined> = async () => {
  const activeEditor = getActiveEditor();
  return {
    result: "success",
    data: activeEditor?.document?.getText(activeEditor?.selection),
  };
};
