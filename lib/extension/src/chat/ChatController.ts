import {
  Conversation,
  Message,
  WebViewMessageSchema,
} from "@rubberduck/common";
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

    if (selectedText.length === 0) {
      return undefined;
    }

    return {
      filename: document.fileName.split("/").pop()!,
      range,
      selectedText,
    };
  }

  async receivePanelMessage(rawMessage: unknown) {
    const message = WebViewMessageSchema.parse(rawMessage);

    switch (message.type) {
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

        const response = await this.openAIClient.generateCompletion({
          prompt: assemblePrompt({
            sections: [
              new ConversationSection({
                messages: conversation.messages,
              }),
              new LinesSection({
                title: "Task",
                lines: ["Write a response that continues the conversation."],
              }),
              new LinesSection({
                title: "Response",
                lines: ["bot:"],
              }),
            ],
          }),
          maxTokens: 1024,
          stop: ["bot:", "user:"],
        });

        conversation.messages.push({
          author: "bot",
          content: response,
        });
        conversation.state = {
          type: "userCanReply",
        };

        await this.updateChatPanel();
      }
    }
  }

  async startChat() {
    await this.showChatPanel();

    this.chatModel.addAndSelectConversation({
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

  async writeTest() {
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
                  title: "Goal",
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

    const conversation: Conversation = {
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
            title: "Goal",
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
    } satisfies Message);
    conversation.state.type = "userCanReply";

    await this.updateChatPanel();
  }
}
