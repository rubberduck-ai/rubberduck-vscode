import * as vscode from "vscode";
import { DiagnoseErrorsConversation } from "./built-in/DiagnoseErrorsConversation";
import { EditCodeConversation } from "./built-in/EditCodeConversation";
import { ExplainCodeConversation } from "./built-in/ExplainCodeConversation";
import { GenerateTestConversation } from "./built-in/GenerateTestConversationModel";
import { ConversationType } from "./ConversationType";
import { basicChatTemplate } from "./template/BuiltInTemplates";
import { conversationTemplateSchema } from "./template/ConversationTemplate";
import { loadConversationTemplatesFromWorkspace } from "./template/loadConversationTemplatesFromWorkspace";
import { TemplateConversationType } from "./template/TemplateConversationType";

export async function initConversationTypes() {
  const builtInConversationTypes = [
    new TemplateConversationType({
      template: conversationTemplateSchema.parse(basicChatTemplate),
    }),
    EditCodeConversation,
    ExplainCodeConversation,
    GenerateTestConversation,
    DiagnoseErrorsConversation,
  ];

  const conversationTypes = new Map<string, ConversationType>();
  for (const factory of builtInConversationTypes) {
    conversationTypes.set(factory.id, factory);
  }

  const workspaceTemplateLoadingResults =
    await loadConversationTemplatesFromWorkspace();
  for (const loadingResult of workspaceTemplateLoadingResults) {
    if (loadingResult.type === "error") {
      vscode.window.showErrorMessage(
        `Error loading conversation template from ${loadingResult.file.path}: ${loadingResult.error}`
      );

      continue;
    }

    const factory = new TemplateConversationType({
      template: loadingResult.template,
    });
    conversationTypes.set(factory.id, factory);
  }
  return conversationTypes;
}
