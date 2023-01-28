import { webviewApi, util } from "@rubberduck/common";
import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
import { BasicSection } from "../prompt/BasicSection";
import { CodeSection } from "../prompt/CodeSection";
import { ConversationSection } from "../prompt/ConversationSection";
import { LinesSection } from "../prompt/LinesSection";
import { assemblePrompt } from "../prompt/Prompt";
import { ChatModel } from "./ChatModel";
import { ChatPanel } from "./ChatPanel";

export class ChatController {
  private readonly chatPanel: ChatPanel;
  private readonly chatModel: ChatModel;
  private readonly openAIClient: OpenAIClient;

  private readonly nextChatId: () => string;

  constructor({
    chatPanel,
    chatModel,
    openAIClient,
  }: {
    chatPanel: ChatPanel;
    chatModel: ChatModel;
    openAIClient: OpenAIClient;
  }) {
    this.chatPanel = chatPanel;
    this.chatModel = chatModel;
    this.openAIClient = openAIClient;

    this.nextChatId = util.createNextId({ prefix: "chat-" });
  }

  private async updateChatPanel() {
    await this.chatPanel.update(this.chatModel);
  }

  private async showChatPanel() {
    await vscode.commands.executeCommand("rubberduck.chat.focus");
  }

  private async getActiveEditorSelectionInput() {
    const activeEditor = vscode.window.activeTextEditor;
    const document = activeEditor?.document;
    const range = activeEditor?.selection;

    if (range == null || document == null) {
      return undefined;
    }

    const selectedText = document.getText(range);
    const filename = document.fileName.split("/").pop();

    if (selectedText.length === 0 || filename == undefined) {
      return undefined;
    }

    return {
      filename,
      range,
      selectedText,
    };
  }

  async receivePanelMessage(rawMessage: unknown) {
    const message = webviewApi.outgoingMessageSchema.parse(rawMessage);
    const type = message.type;

    switch (type) {
      case "clickCollapsedExplanation": {
        this.chatModel.selectedConversationIndex = message.data.index;
        await this.updateChatPanel();
        break;
      }
      case "sendChatMessage": {
        const conversation = this.chatModel.conversations[message.data.index];
        conversation.messages.push({
          author: "user",
          content: message.data.message,
        });
        conversation.state = {
          type: "waitingForBotAnswer",
        };

        await this.updateChatPanel();

        const botRole = "Bot";
        const userRole = "Developer";

        const lastMessage =
          conversation.messages[conversation.messages.length - 1];

        const response = await this.openAIClient.generateCompletion({
          prompt: assemblePrompt({
            sections: [
              new LinesSection({
                title: "Instructions",
                lines: [
                  "Continue the conversation below.",
                  "Pay special attention to the current ${userRole.toLocaleLowerCase()} request.",
                ],
              }),
              new LinesSection({
                title: "Current request",
                lines: [`${userRole}: ${lastMessage}`],
              }),
              new ConversationSection({
                messages: conversation.messages,
              }),
              new LinesSection({
                title: "Task",
                lines: [
                  "Write a response that continues the conversation.",
                  `Stay focused on current ${userRole.toLocaleLowerCase()} request.`,
                  "Consider the possibility that there might not be a solution.",
                  "Ask for clarification if the message does not make sense or more input is needed.",
                  "Use the style of a documentation article.",
                  "Omit any links.",
                  "Include code snippets using Markdown where appropriate.",
                ],
              }),
              new LinesSection({
                title: "Response",
                lines: [`${botRole}:`],
              }),
            ],
          }),
          maxTokens: 1024,
          stop: [`${botRole}:`, `${userRole}:`],
        });

        conversation.messages.push({
          author: "bot",
          content: response,
        });
        conversation.state = {
          type: "userCanReply",
        };

        await this.updateChatPanel();
        break;
      }
      case "startChat": {
        await this.startChat();
        break;
      }
      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`unsupported type: ${exhaustiveCheck}`);
      }
    }
  }

  async startChat() {
    await this.showChatPanel();

    this.chatModel.addAndSelectConversation({
      id: this.nextChatId(),
      trigger: {
        type: "startChat",
      },
      messages: [],
      state: {
        type: "userCanReply",
      },
    });

    await this.updateChatPanel();
  }

  async generateTest() {
    const input = await this.getActiveEditorSelectionInput();

    if (input == null) {
      return;
    }

    const test: string = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
      },
      async (progress) => {
        progress.report({
          message: "Generating test…",
        });

        return (
          await this.openAIClient.generateCompletion({
            prompt: assemblePrompt({
              sections: [
                new LinesSection({
                  title: "Instructions",
                  lines: ["Write a unit test for the code below."],
                }),
                new CodeSection({
                  code: input.selectedText,
                }),
                new LinesSection({
                  title: "Task",
                  lines: [
                    "Write a unit test that contains test cases for the happy path and for all edge cases.",
                  ],
                }),
                new LinesSection({
                  title: "Answer",
                  lines: ["```"],
                }),
              ],
            }),
            maxTokens: 2048,
            stop: ["```"],
          })
        ).trim();
      }
    );

    await vscode.window.showTextDocument(
      await vscode.workspace.openTextDocument({
        content: test,
      }),
      vscode.ViewColumn.Beside
    );
  }

  async explainCode() {
    const input = await this.getActiveEditorSelectionInput();

    if (input == null) {
      return;
    }

    await this.showChatPanel();

    const conversation: webviewApi.Conversation = {
      id: this.nextChatId(),
      trigger: {
        type: "explainCode",
        filename: input.filename,
        selectionStartLine: input.range.start.line,
        selectionEndLine: input.range.end.line,
        selection: input.selectedText,
      },
      messages: [],
      state: {
        type: "waitingForBotAnswer",
      },
    };

    this.chatModel.addAndSelectConversation(conversation);

    await this.updateChatPanel();

    const explanation = await this.openAIClient.generateCompletion({
      prompt: assemblePrompt({
        sections: [
          new LinesSection({
            title: "Instructions",
            lines: [
              "Summarize the code below (emphasizing its key functionality).",
            ],
          }),
          new CodeSection({
            code: input.selectedText,
          }),
          new LinesSection({
            title: "Task",
            lines: [
              "Summarize the code at a high level (including goal and purpose) with an emphasis on its key functionality.",
            ],
          }),
          new BasicSection({
            title: "Answer",
          }),
        ],
      }),
      maxTokens: 512,
    });

    conversation.messages.push({
      author: "bot",
      content: explanation,
    } satisfies webviewApi.Message);
    conversation.state.type = "userCanReply";

    await this.updateChatPanel();
  }
}
