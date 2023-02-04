import * as vscode from "vscode";
import { ConversationTemplate } from "./ConversationTemplate";
import { parseConversationTemplate } from "./parseConversationTemplate";

export type ConversationTemplateLoadingResult =
  | {
      type: "success";
      file: vscode.Uri;
      template: ConversationTemplate;
    }
  | {
      type: "error";
      file: vscode.Uri;
      error: unknown;
    };

const TEMPLATE_GLOB = ".rubberduck/template/*.rdt.md";

export async function loadConversationTemplatesFromWorkspace(): Promise<
  Array<ConversationTemplateLoadingResult>
> {
  const files = await vscode.workspace.findFiles(TEMPLATE_GLOB);

  return await Promise.all(
    files.map(async (file) => {
      try {
        const data = await vscode.workspace.fs.readFile(file);
        const content = Buffer.from(data).toString("utf8");

        const parseResult = parseConversationTemplate(content);

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
    })
  );
}
