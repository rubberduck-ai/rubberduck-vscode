import * as vscode from "vscode";
import { RubberduckTemplateLoadResult } from "./RubberduckTemplateLoadResult";
import { parseRubberduckTemplate } from "./parseRubberduckTemplate";

export const loadConversationFromFile = async (
  file: vscode.Uri
): Promise<RubberduckTemplateLoadResult> => {
  try {
    const data = await vscode.workspace.fs.readFile(file);
    const content = Buffer.from(data).toString("utf8");

    const parseResult = parseRubberduckTemplate(content);

    if (parseResult.type === "error") {
      return {
        type: "error" as const,
        file,
        error: parseResult.error,
      };
    }

    return {
      type: "success" as const,
      file,
      template: parseResult.template,
    };
  } catch (error) {
    return {
      type: "error" as const,
      file,
      error,
    };
  }
};
