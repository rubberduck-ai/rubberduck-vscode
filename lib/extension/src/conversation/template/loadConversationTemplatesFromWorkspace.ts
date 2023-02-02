import * as vscode from "vscode";
import {
  ConversationTemplate,
  conversationTemplateSchema,
} from "./ConversationTemplate";
import secureJSON from "secure-json-parse";

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

const TEMPLATE_GLOB = ".rubberduck/template/*.json";

export async function loadConversationTemplatesFromWorkspace(): Promise<
  Array<ConversationTemplateLoadingResult>
> {
  const files = await vscode.workspace.findFiles(TEMPLATE_GLOB);

  return await Promise.all(
    files.map(async (file) => {
      try {
        const data = await vscode.workspace.fs.readFile(file);
        const content = Buffer.from(data).toString("utf8");
        const contentJson = secureJSON.parse(content);
        const template = conversationTemplateSchema.parse(contentJson);

        return {
          type: "success" as const,
          file,
          template,
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
