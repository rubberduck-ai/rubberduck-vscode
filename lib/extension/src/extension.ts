import * as vscode from "vscode";
import { ChatController } from "./chat/ChatController";
import { ChatModel } from "./chat/ChatModel";
import { ChatPanel } from "./chat/ChatPanel";
import { DiagnoseErrorsConversationModel } from "./chat/DiagnoseErrorsConversationModel";
import { EditCodeConversationModel } from "./chat/EditCodeConversationModel";
import { ExplainCodeConversationModel } from "./chat/ExplainCodeConversationModel";
import { GenerateTestConversationModel } from "./chat/GenerateTestConversationModel";
import { ConversationTemplateSchema } from "./conversation-template/ConversationTemplate";
import { TemplateConversationFactory } from "./conversation-template/TemplateConversationFactory";
import { DiffEditorManager } from "./diff/DiffEditorManager";
import { ApiKeyManager } from "./openai/ApiKeyManager";
import { OpenAIClient } from "./openai/OpenAIClient";

export const activate = async (context: vscode.ExtensionContext) => {
  const apiKeyManager = new ApiKeyManager({
    secretStorage: context.secrets,
  });

  const basicChat = new TemplateConversationFactory({
    template: ConversationTemplateSchema.parse({
      id: "chat",
      engineVersion: 0,
      type: "basic-chat",
      codicon: "comment-discussion",
      prompt: {
        sections: [
          {
            type: "lines",
            title: "Instructions",
            lines: [
              "Continue the conversation below.",
              "Pay special attention to the current developer request.",
            ],
          },
          {
            type: "lines",
            title: "Current Request",
            lines: ["Developer: ${lastMessage}"],
          },
          {
            type: "optional-selected-code",
            title: "Selected Code",
          },
          {
            type: "conversation",
            roles: {
              bot: "Bot",
              user: "Developer",
            },
          },
          {
            type: "lines",
            title: "Task",
            lines: [
              "Write a response that continues the conversation.",
              "Stay focused on current developer request.",
              "Consider the possibility that there might not be a solution.",
              "Ask for clarification if the message does not make sense or more input is needed.",
              "Use the style of a documentation article.",
              "Omit any links.",
              "Include code snippets (using Markdown) and examples where appropriate.",
            ],
          },
          {
            type: "lines",
            title: "Response",
            lines: ["Bot:"],
          },
        ],
        maxTokens: 1024,
        stop: ["Bot:", "Developer:"],
      },
    }),
  });

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
      [basicChat.id]: basicChat,
      [EditCodeConversationModel.id]: EditCodeConversationModel,
      [ExplainCodeConversationModel.id]: ExplainCodeConversationModel,
      [GenerateTestConversationModel.id]: GenerateTestConversationModel,
      [DiagnoseErrorsConversationModel.id]: DiagnoseErrorsConversationModel,
    },
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
