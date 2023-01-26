import * as vscode from "vscode";
import { ApiKeyManager } from "./ApiKeyManager";

export const activate = async (context: vscode.ExtensionContext) => {
  const apiKeyManager = new ApiKeyManager({
    secretStorage: context.secrets,
  });

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "rubberduck.enterOpenAIApiKey",
      apiKeyManager.enterOpenAIApiKey.bind(apiKeyManager)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "rubberduck.clearOpenAIApiKey",
      async () => {
        await apiKeyManager.clearOpenAIApiKey();
        vscode.window.showInformationMessage('OpenAI API key cleared.');
      }
    )
  );
};

export const deactivate = async () => {};
