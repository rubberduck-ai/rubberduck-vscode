import * as vscode from "vscode";
import { ChatController } from "./chat/ChatController";
import { ChatModel } from "./chat/ChatModel";
import { ChatPanel } from "./chat/ChatPanel";
import { ConversationModelFactory } from "./chat/ConversationModelFactory";
import { DiagnoseErrorsConversationModel } from "./chat/DiagnoseErrorsConversationModel";
import { EditCodeConversationModel } from "./chat/EditCodeConversationModel";
import { ExplainCodeConversationModel } from "./chat/ExplainCodeConversationModel";
import { GenerateTestConversationModel } from "./chat/GenerateTestConversationModel";
import { basicChatTemplate } from "./conversation-template/BuiltInTemplates";
import { conversationTemplateSchema } from "./conversation-template/ConversationTemplate";
import { loadConversationTemplatesFromWorkspace } from "./conversation-template/loadConversationTemplatesFromWorkspace";
import { TemplateConversationFactory } from "./conversation-template/TemplateConversationFactory";
import { DiffEditorManager } from "./diff/DiffEditorManager";
import { ApiKeyManager } from "./openai/ApiKeyManager";
import { OpenAIClient } from "./openai/OpenAIClient";

export const activate = async (context: vscode.ExtensionContext) => {
  const apiKeyManager = new ApiKeyManager({
    secretStorage: context.secrets,
  });

  const basicChat = new TemplateConversationFactory({
    template: conversationTemplateSchema.parse(basicChatTemplate),
  });

  const conversationTypes = new Map<string, ConversationModelFactory>();
  conversationTypes.set(basicChat.id, basicChat);
  conversationTypes.set(
    EditCodeConversationModel.id,
    EditCodeConversationModel
  );
  conversationTypes.set(
    ExplainCodeConversationModel.id,
    ExplainCodeConversationModel
  );
  conversationTypes.set(
    GenerateTestConversationModel.id,
    GenerateTestConversationModel
  );
  conversationTypes.set(
    DiagnoseErrorsConversationModel.id,
    DiagnoseErrorsConversationModel
  );

  const workspaceTemplateLoadingResults =
    await loadConversationTemplatesFromWorkspace();
  for (const loadingResult of workspaceTemplateLoadingResults) {
    if (loadingResult.type === "error") {
      vscode.window.showErrorMessage(
        `Error loading conversation template from ${loadingResult.file.path}: ${loadingResult.error}`
      );

      continue;
    }

    const factory = new TemplateConversationFactory({
      template: loadingResult.template,
    });
    conversationTypes.set(factory.id, factory);
  }

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
    conversationTypes,
    basicChatTemplateId: basicChat.id,
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
      chatController.createConversation(basicChat.id);
    }),
    vscode.commands.registerCommand("rubberduck.editCode", () => {
      chatController.createConversation(EditCodeConversationModel.id);
    }),
    vscode.commands.registerCommand("rubberduck.touchBar.startChat", () => {
      chatController.createConversation(basicChat.id);
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
