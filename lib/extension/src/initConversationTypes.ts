import * as vscode from "vscode";
import { ConversationModelFactory } from "./chat/ConversationModelFactory";
import { DiagnoseErrorsConversationModel } from "./chat/DiagnoseErrorsConversationModel";
import { EditCodeConversationModel } from "./chat/EditCodeConversationModel";
import { ExplainCodeConversationModel } from "./chat/ExplainCodeConversationModel";
import { GenerateTestConversationModel } from "./chat/GenerateTestConversationModel";
import { basicChatTemplate } from "./conversation-template/BuiltInTemplates";
import { conversationTemplateSchema } from "./conversation-template/ConversationTemplate";
import { loadConversationTemplatesFromWorkspace } from "./conversation-template/loadConversationTemplatesFromWorkspace";
import { TemplateConversationFactory } from "./conversation-template/TemplateConversationFactory";

export async function initConversationTypes() {
  const builtInConversationFactories = [
    new TemplateConversationFactory({
      template: conversationTemplateSchema.parse(basicChatTemplate),
    }),
    EditCodeConversationModel,
    ExplainCodeConversationModel,
    GenerateTestConversationModel,
    DiagnoseErrorsConversationModel,
  ];

  const conversationTypes = new Map<string, ConversationModelFactory>();
  for (const factory of builtInConversationFactories) {
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

    const factory = new TemplateConversationFactory({
      template: loadingResult.template,
    });
    conversationTypes.set(factory.id, factory);
  }
  return conversationTypes;
}
