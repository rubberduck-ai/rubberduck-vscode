import * as vscode from "vscode";
import { loadConversationFromFile } from "./loadConversationTemplateFromFile";
import { ConversationTemplateLoadingResult } from "./ConversationTemplateLoadingResult";

const TEMPLATE_GLOB = ".rubberduck/template/**/*.rdt.md";

export async function loadConversationTemplatesFromWorkspace(): Promise<
  Array<ConversationTemplateLoadingResult>
> {
  const files = await vscode.workspace.findFiles(TEMPLATE_GLOB);
  return await Promise.all(files.map(loadConversationFromFile));
}
