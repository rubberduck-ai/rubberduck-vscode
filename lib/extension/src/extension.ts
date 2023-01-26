import * as vscode from "vscode";
import { ChatModel } from "./chat/ChatModel";
import { ChatPanel } from "./chat/ChatPanel";
import { ApiKeyManager } from "./openai/ApiKeyManager";
import { OpenAIClient } from "./openai/OpenAIClient";

export const activate = async (context: vscode.ExtensionContext) => {
  const apiKeyManager = new ApiKeyManager({
    secretStorage: context.secrets,
  });

  const openAIClient = new OpenAIClient({
    apiKeyManager,
  });

  const chatPanel = new ChatPanel({
    extensionUri: context.extensionUri,
  });

  const chatModel = new ChatModel();

  chatPanel.onDidReceiveMessage(async (message: any) => {
    switch (message.type) {
      case "clickCollapsedExplanation":
        chatModel.selectedExplanationIndex = message.data.index;
        await chatPanel.update(chatModel);
        break;
    }
  });

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("rubberduck.chat", chatPanel)
  );

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
        vscode.window.showInformationMessage("OpenAI API key cleared.");
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("rubberduck.chat.explainCode", async () => {
      const activeEditor = vscode.window.activeTextEditor;
      const document = activeEditor?.document;
      const range = activeEditor?.selection;

      if (range == null || document == null) {
        return;
      }

      const selectedText = document.getText(range);

      if (selectedText.length === 0) {
        return;
      }

      await vscode.commands.executeCommand("rubberduck.chat.focus");

      const explanation = {
        filename: document.fileName.split("/").pop()!,
        content: undefined,
        selectionStartLine: range.start.line,
        selectionEndLine: range.end.line,
      };

      chatModel.explanations.push(explanation);
      chatModel.selectedExplanationIndex = chatModel.explanations.length - 1;

      await chatPanel.update(chatModel); // update with loading state

      explanation.content = await openAIClient.generateCompletion({
        prompt: `Explain the code below:\n\n ${selectedText}`,
      });

      await chatPanel.update(chatModel);
    })
  );
};

export const deactivate = async () => {};
