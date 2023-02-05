import * as vscode from "vscode";
import { DiagnoseErrorsConversation } from "./built-in/DiagnoseErrorsConversation";
import { EditCodeConversation } from "./built-in/EditCodeConversation";
import { GenerateTestConversation } from "./built-in/GenerateTestConversationModel";
import { ConversationType } from "./ConversationType";
import { explainCodeTemplate } from "./built-in/ExplainCodeTemplate";
import { conversationTemplateSchema } from "./template/ConversationTemplate";
import { loadConversationTemplatesFromWorkspace } from "./template/loadConversationTemplatesFromWorkspace";
import { TemplateConversationType } from "./template/TemplateConversationType";
import { loadConversationFromFile } from "./template/loadConversationTemplateFromFile";

export class ConversationTypesProvider {
  private readonly extensionUri: vscode.Uri;
  private readonly conversationTypes = new Map<string, ConversationType>();

  constructor({ extensionUri }: { extensionUri: vscode.Uri }) {
    this.extensionUri = extensionUri;
  }

  getConversationType(id: string) {
    return this.conversationTypes.get(id);
  }

  getConversationTypes() {
    return [...this.conversationTypes.values()];
  }

  async loadConversationTypes() {
    const basicTemplateLoadResult = await loadConversationFromFile(
      vscode.Uri.joinPath(
        this.extensionUri,
        "template",
        "chat-i18n",
        "chat-en.rdt.md"
      )
    );

    if (basicTemplateLoadResult.type === "error") {
      throw new Error(
        `Failed to load basic chat template: ${basicTemplateLoadResult.error}`
      );
    }

    const builtInConversationTypes = [
      new TemplateConversationType({
        template: basicTemplateLoadResult.template,
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

      if (loadingResult.template.isEnabled === false) {
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
