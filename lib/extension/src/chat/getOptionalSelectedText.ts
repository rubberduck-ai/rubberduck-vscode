import { getActiveEditor } from "../vscode/getActiveEditor";
import { getInput } from "./getInput";

export const getOptionalSelectedText: getInput<{
  selectedText: string | undefined;
}> = async () => {
  const activeEditor = getActiveEditor();

  const document = activeEditor?.document;
  const range = activeEditor?.selection;

  return {
    result: "success",
    data: {
      selectedText: document?.getText(range),
    },
  };
};
