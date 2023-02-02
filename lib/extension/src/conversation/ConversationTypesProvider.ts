import * as vscode from "vscode";
import { DiagnoseErrorsConversation } from "./built-in/DiagnoseErrorsConversation";
import { EditCodeConversation } from "./built-in/EditCodeConversation";
import { GenerateTestConversation } from "./built-in/GenerateTestConversationModel";
import { ConversationType } from "./ConversationType";
import {
  basicChatTemplate,
  explainCodeTemplate,
} from "./template/BuiltInTemplates";
import { conversationTemplateSchema } from "./template/ConversationTemplate";
import { loadConversationTemplatesFromWorkspace } from "./template/loadConversationTemplatesFromWorkspace";
import { TemplateConversationType } from "./template/TemplateConversationType";

export class ConversationTypesProvider {
  private readonly conversationTypes = new Map<string, ConversationType>();

  getConversationType(id: string) {
    return this.conversationTypes.get(id);
  }

  getConversationTypes() {
    return [...this.conversationTypes.values()];
  }

  async loadConversationTypes() {
    const builtInConversationTypes = [
      new TemplateConversationType({
        template: conversationTemplateSchema.parse(basicChatTemplate),
        source: "built-in",
      }),
      new TemplateConversationType({
        template: conversationTemplateSchema.parse(explainCodeTemplate),
        source: "built-in",
      }),
      EditCodeConversation,
      GenerateTestConversation,
      DiagnoseErrorsConversation,
    ];

    this.conversationTypes.clear();

    for (const conversationType of builtInConversationTypes) {
      this.conversationTypes.set(conversationType.id, conversationType);
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

      const type = new TemplateConversationType({
        template: loadingResult.template,
        source: "local-workspace",
      });
      this.conversationTypes.set(type.id, type);
    }
  }
}
