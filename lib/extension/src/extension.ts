import * as vscode from "vscode";
import { ChatController } from "./chat/ChatController";
import { ChatModel } from "./chat/ChatModel";
import { ChatPanel } from "./chat/ChatPanel";
import { ConversationTypesProvider } from "./conversation/ConversationTypesProvider";
import { DiffEditorManager } from "./diff/DiffEditorManager";
import { ApiKeyManager } from "./openai/ApiKeyManager";
import { OpenAIClient } from "./openai/OpenAIClient";

export const activate = async (context: vscode.ExtensionContext) => {
  const apiKeyManager = new ApiKeyManager({
    secretStorage: context.secrets,
  });

  const outputChannel = vscode.window.createOutputChannel("Rubberduck");

  const hasOpenAIApiKey = await apiKeyManager.hasOpenAIApiKey();
  const chatPanel = new ChatPanel({
    extensionUri: context.extensionUri,
    apiKeyManager,
    hasOpenAIApiKey,
  });

  const chatModel = new ChatModel();

  const conversationTypesProvider = new ConversationTypesProvider({
    extensionUri: context.extensionUri,
  });
  await conversationTypesProvider.loadConversationTypes();

  const chatController = new ChatController({
    chatPanel,
    chatModel,
    openAIClient: new OpenAIClient({
      apiKeyManager,
      log(message) {
        outputChannel.appendLine(message);
      },
      async isPromptLoggingEnabled() {
        return true;
      },
    }),
    diffEditorManager: new DiffEditorManager({
      extensionUri: context.extensionUri,
    }),
    getConversationType(id: string) {
      return conversationTypesProvider.getConversationType(id);
    },
    basicChatTemplateId: "chat-en",
  });

  chatPanel.onDidReceiveMessage(
    chatController.receivePanelMessage.bind(chatController)
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("rubberduck.chat", chatPanel),
    vscode.commands.registerCommand(
      "rubberduck.enterOpenAIApiKey",
      apiKeyManager.enterOpenAIApiKey.bind(apiKeyManager)
    ),
    vscode.commands.registerCommand(
      "rubberduck.clearOpenAIApiKey",
      async () => {
        await apiKeyManager.clearOpenAIApiKey();
        vscode.window.showInformationMessage("OpenAI API key cleared.");
      }
    ),
    vscode.commands.registerCommand("rubberduck.diagnoseErrors", () => {
      chatController.createConversation("diagnose-errors");
    }),
    vscode.commands.registerCommand("rubberduck.explainCode", () => {
      chatController.createConversation("explain-code");
    }),
    vscode.commands.registerCommand("rubberduck.findBugs", () => {
      chatController.createConversation("find-bugs");
    }),
    vscode.commands.registerCommand("rubberduck.generateCode", () => {
      chatController.createConversation("generate-code");
    }),
    vscode.commands.registerCommand("rubberduck.generateUnitTest", () => {
      chatController.createConversation("generate-unit-test");
    }),
    vscode.commands.registerCommand("rubberduck.startChat", () => {
      chatController.createConversation("chat-en");
    }),
    vscode.commands.registerCommand("rubberduck.editCode", () => {
      chatController.createConversation("edit-code");
    }),
    vscode.commands.registerCommand("rubberduck.startCustomChat", async () => {
      const items = conversationTypesProvider
        .getConversationTypes()
        .map((conversationType) => ({
          id: conversationType.id,
          label: conversationType.label,
          description: conversationType.source,
          detail: conversationType.description,
        }));

      const result = await vscode.window.showQuickPick(items, {
        title: `Start Custom Chat…`,
        matchOnDescription: true,
        matchOnDetail: true,
        placeHolder: "Select conversation type…",
      });

      if (result == undefined) {
        return; // user cancelled
      }

      await chatController.createConversation(result.id);
    }),
    vscode.commands.registerCommand("rubberduck.touchBar.startChat", () => {
      chatController.createConversation("chat-en");
    }),
    vscode.commands.registerCommand("rubberduck.showChatPanel", async () => {
      await chatController.showChatPanel();
    }),
    vscode.commands.registerCommand("rubberduck.getStarted", async () => {
      await vscode.commands.executeCommand("workbench.action.openWalkthrough", {
        category: `rubberduck.rubberduck-vscode#rubberduck`,
      });
    }),
    vscode.commands.registerCommand("rubberduck.reloadTemplates", async () => {
      await conversationTypesProvider.loadConversationTypes();
      vscode.window.showInformationMessage("Rubberduck templates reloaded.");
    }),
    vscode.commands.registerCommand("rubberduck.showLogs", () => {
      outputChannel.show(true);
    })
  );
};

export const deactivate = async () => {
  // noop
};
