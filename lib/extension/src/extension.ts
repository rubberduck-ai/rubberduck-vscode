import { Explanation } from "@rubberduck/common";
import axios from "axios";
import * as vscode from "vscode";
import { ApiKeyManager } from "./ApiKeyManager";
import { ChatPanel } from "./chat/ChatPanel";

export const activate = async (context: vscode.ExtensionContext) => {
  const apiKeyManager = new ApiKeyManager({
    secretStorage: context.secrets,
  });

  const chatPanel = new ChatPanel({
    extensionUri: context.extensionUri,
  });

  const explanations: Array<Explanation> = [];

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

      const openAIApiKey = await apiKeyManager.getOpenAIApiKey();

      const response = await axios.post(
        `https://api.openai.com/v1/completions`,
        {
          model: "text-davinci-003",
          prompt: `Explain the code below:\n\n ${selectedText}`,
          max_tokens: 1024,
          temperature: 0,
          // top_p is excluded because temperature is set
          best_of: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAIApiKey}`,
          },
        }
      );

      const completion = response.data.choices[0].text;

      await vscode.commands.executeCommand("rubberduck.chat.focus");

      explanations.push({
        filename: document.fileName.split("/").pop()!,
        content: completion,
        selectionStartLine: range.start.line,
        selectionEndLine: range.end.line,
      });

      await chatPanel.update({
        explanations,
      });
    })
  );
};

export const deactivate = async () => {};
