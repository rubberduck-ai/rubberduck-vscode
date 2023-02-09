import * as vscode from "vscode";
import { EditCodeConversation } from "./built-in/EditCodeConversation";
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

  private async loadBuiltinTemplate(...path: string[]) {
    const fileUri = vscode.Uri.joinPath(this.extensionUri, "template", ...path);
    const result = await loadConversationFromFile(fileUri);

    if (result.type === "error") {
      throw new Error(
        `Failed to load chat template '${fileUri.toString()}': ${result.error}`
      );
    }

    return new TemplateConversationType({
      template: result.template,
      source: "built-in",
    });
  }

  async loadConversationTypes() {
    const builtInConversationTypes = [
      await this.loadBuiltinTemplate("chat-i18n", "chat-en.rdt.md"),
      await this.loadBuiltinTemplate("task", "diagnose-errors.rdt.md"),
      await this.loadBuiltinTemplate("task", "explain-code.rdt.md"),
      await this.loadBuiltinTemplate("task", "find-bugs.rdt.md"),
      await this.loadBuiltinTemplate("task", "generate-unit-test.rdt.md"),
      EditCodeConversation,
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
