import * as vscode from "vscode";
import { DiagnoseErrorsConversation } from "./built-in/DiagnoseErrorsConversation";
import { EditCodeConversation } from "./built-in/EditCodeConversation";
import { GenerateTestConversation } from "./built-in/GenerateTestConversationModel";
import { ConversationType } from "./ConversationType";
import { loadConversationFromFile } from "./template/loadConversationTemplateFromFile";
import { loadConversationTemplatesFromWorkspace } from "./template/loadConversationTemplatesFromWorkspace";
import { TemplateConversationType } from "./template/TemplateConversationType";

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

  private async loadTemplate(...path: string[]) {
    const fileUri = vscode.Uri.joinPath(this.extensionUri, "template", ...path);
    const result = await loadConversationFromFile(fileUri);

    if (result.type === "error") {
      throw new Error(
        `Failed to load chat template '${fileUri.toString()}': ${result.error}`
      );
    }

    return result.template;
  }

  async loadConversationTypes() {
    const builtInConversationTypes = [
      new TemplateConversationType({
        template: await this.loadTemplate("chat-i18n", "chat-en.rdt.md"),
        source: "built-in",
      }),
      new TemplateConversationType({
        template: await this.loadTemplate("task", "explain-code.rdt.md"),
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
