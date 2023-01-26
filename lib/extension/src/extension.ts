import axios from "axios";
import * as vscode from "vscode";
import { ApiKeyManager } from "./ApiKeyManager";
import { ChatModel } from "./chat/ChatModel";
import { ChatPanel } from "./chat/ChatPanel";

export const activate = async (context: vscode.ExtensionContext) => {
  const apiKeyManager = new ApiKeyManager({
    secretStorage: context.secrets,
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
      explanation.content = completion;

      await chatPanel.update(chatModel);
    })
  );
};

export const deactivate = async () => {};
