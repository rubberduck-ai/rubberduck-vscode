import * as vscode from "vscode";
import { getActiveEditor } from "../../vscode/getActiveEditor";
import { getInput } from "./getInput";

export type ErrorInRange = {
  code?: string | number | undefined;
  source?: string | undefined;
  message: string;
  line: number;
};

export const getErrorsInSelectionRange: getInput<{
  errors: Array<ErrorInRange>;
  rangeText: string;
  range: vscode.Range;
}> = async () => {
  const activeEditor = getActiveEditor();

  if (activeEditor == undefined) {
    return {
      type: "unavailable",
      display: "info",
      message: "No active editor",
    };
  }

  const document = activeEditor.document;

  // expand range to beginning and end of line, because ranges tend to be inaccurate
  const range = new vscode.Range(
    new vscode.Position(activeEditor.selection.start.line, 0),
    new vscode.Position(activeEditor.selection.end.line + 1, 0)
  );

  const errors = vscode.languages
    .getDiagnostics(document.uri)
    .filter(
      (diagnostic) =>
        diagnostic.severity === vscode.DiagnosticSeverity.Error &&
        // line based filtering, because the ranges tend to be to inaccurate:
        diagnostic.range.start.line >= range.start.line &&
        diagnostic.range.end.line <= range.end.line
    )
    .map((error) => ({
      line: error.range.start.line,
      message: error.message,
      source: error.source,
      code: typeof error.code === "object" ? error.code.value : error.code,
    }));

  if (errors.length === 0) {
    return {
      type: "unavailable",
      display: "info",
      message: "No errors found.",
    };
  }

  const rangeText = document.getText(range);

  return {
    type: "success",
    data: {
      errors,
      rangeText,
      range,
    },
  };
};
