import * as vscode from "vscode";
import { ChatController } from "./chat/ChatController";
import { ChatModel } from "./chat/ChatModel";
import { ChatPanel } from "./chat/ChatPanel";
import { DiagnoseErrorsConversation } from "./conversation/built-in/DiagnoseErrorsConversation";
import { EditCodeConversation } from "./conversation/built-in/EditCodeConversation";
import { ExplainCodeConversation } from "./conversation/built-in/ExplainCodeConversation";
import { GenerateTestConversation } from "./conversation/built-in/GenerateTestConversationModel";
import { loadConversationTypes } from "./conversation/loadConversationTypes";
import { BASIC_CHAT_ID } from "./conversation/template/BuiltInTemplates";
import { DiffEditorManager } from "./diff/DiffEditorManager";
import { ApiKeyManager } from "./openai/ApiKeyManager";
import { OpenAIClient } from "./openai/OpenAIClient";

export const activate = async (context: vscode.ExtensionContext) => {
  const apiKeyManager = new ApiKeyManager({
    secretStorage: context.secrets,
  });

  const chatPanel = new ChatPanel({
    extensionUri: context.extensionUri,
  });

  const chatModel = new ChatModel();

  const conversationTypes = await loadConversationTypes();

  const chatController = new ChatController({
    chatPanel,
    chatModel,
    openAIClient: new OpenAIClient({
      apiKeyManager,
    }),
    diffEditorManager: new DiffEditorManager({
      extensionUri: context.extensionUri,
    }),
    conversationTypes,
    basicChatTemplateId: BASIC_CHAT_ID,
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
      chatController.createConversation(DiagnoseErrorsConversation.id);
    }),
    vscode.commands.registerCommand("rubberduck.explainCode", () => {
      chatController.createConversation(ExplainCodeConversation.id);
    }),
    vscode.commands.registerCommand("rubberduck.generateTest", () => {
      chatController.createConversation(GenerateTestConversation.id);
    }),
    vscode.commands.registerCommand("rubberduck.startChat", () => {
      chatController.createConversation(BASIC_CHAT_ID);
    }),
    vscode.commands.registerCommand("rubberduck.editCode", () => {
      chatController.createConversation(EditCodeConversation.id);
    }),
    vscode.commands.registerCommand("rubberduck.touchBar.startChat", () => {
      chatController.createConversation(BASIC_CHAT_ID);
    }),
    vscode.commands.registerCommand("rubberduck.showChatPanel", async () => {
      await chatController.showChatPanel();
    }),
    vscode.commands.registerCommand("rubberduck.getStarted", async () => {
      await vscode.commands.executeCommand("workbench.action.openWalkthrough", {
        category: `rubberduck.rubberduck-vscode#rubberduck`,
      });
    })
  );
};

export const deactivate = async () => {
  // noop
};
