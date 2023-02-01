import * as vscode from "vscode";
import { BasicChatConversationTemplate } from "./chat/BasicChatConversationTemplate";
import { ChatController } from "./chat/ChatController";
import { ChatModel } from "./chat/ChatModel";
import { ChatPanel } from "./chat/ChatPanel";
import { DiagnoseErrorsConversationModel } from "./chat/DiagnoseErrorsConversationModel";
import { EditCodeConversationModel } from "./chat/EditCodeConversationModel";
import { ExplainCodeConversationModel } from "./chat/ExplainCodeConversationModel";
import { GenerateTestConversationModel } from "./chat/GenerateTestConversationModel";
import { DiffEditorManager } from "./diff/DiffEditorManager";
import { ApiKeyManager } from "./openai/ApiKeyManager";
import { OpenAIClient } from "./openai/OpenAIClient";

export const activate = async (context: vscode.ExtensionContext) => {
  const apiKeyManager = new ApiKeyManager({
    secretStorage: context.secrets,
  });

  const basicChatTemplate = new BasicChatConversationTemplate();

  const chatPanel = new ChatPanel({
    extensionUri: context.extensionUri,
  });

  const chatModel = new ChatModel();

  const chatController = new ChatController({
    chatPanel,
    chatModel,
    openAIClient: new OpenAIClient({
      apiKeyManager,
    }),
    diffEditorManager: new DiffEditorManager({
      extensionUri: context.extensionUri,
    }),
    conversationTypes: {
      [basicChatTemplate.id]: basicChatTemplate,
      [EditCodeConversationModel.id]: EditCodeConversationModel,
      [ExplainCodeConversationModel.id]: ExplainCodeConversationModel,
      [GenerateTestConversationModel.id]: GenerateTestConversationModel,
      [DiagnoseErrorsConversationModel.id]: DiagnoseErrorsConversationModel,
    },
    basicChatTemplateId: basicChatTemplate.id,
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
      chatController.createConversation(DiagnoseErrorsConversationModel.id);
    }),
    vscode.commands.registerCommand("rubberduck.explainCode", () => {
      chatController.createConversation(ExplainCodeConversationModel.id);
    }),
    vscode.commands.registerCommand("rubberduck.generateTest", () => {
      chatController.createConversation(GenerateTestConversationModel.id);
    }),
    vscode.commands.registerCommand("rubberduck.startChat", () => {
      chatController.createConversation(basicChatTemplate.id);
    }),
    vscode.commands.registerCommand("rubberduck.editCode", () => {
      chatController.createConversation(EditCodeConversationModel.id);
    }),
    vscode.commands.registerCommand("rubberduck.touchBar.startChat", () => {
      chatController.createConversation(basicChatTemplate.id);
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
