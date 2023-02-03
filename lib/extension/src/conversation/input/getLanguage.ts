import { getActiveEditor } from "../../vscode/getActiveEditor";
import { getInput } from "./getInput";

export const getLanguage: getInput<string | undefined> = async () => ({
  type: "success",
  data: getActiveEditor()?.document?.languageId,
});
