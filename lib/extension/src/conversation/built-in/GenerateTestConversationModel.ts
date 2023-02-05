import * as vscode from "vscode";
import { OpenAIClient } from "../../openai/OpenAIClient";
import { Conversation } from "../../conversation/Conversation";
import { generateGenerateTestCompletion } from "./generateGenerateTestCompletion";
import { generateRefineCodeCompletion } from "./generateRefineCodeCompletion";
import { CreateConversationResult } from "../ConversationType";
import { getRequiredSelectedText } from "../input/getRequiredSelectedText";
import { getFileInformation } from "../input/getFileInformation";

export class GenerateTestConversation extends Conversation {
  static id = "generateTest";
  static label = "Generate Test";
  static description = "Generate tests for the selected code.";
  static source = "built-in" as const;
  static variables = [];

  static async createConversation({
    conversationId,
    openAIClient,
    updateChatPanel,
  }: {
    conversationId: string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
  }): Promise<CreateConversationResult> {
    const result = await getRequiredSelectedText();
    const result2 = await getFileInformation();

    if (result.type === "unavailable") {
      return result;
    }
    if (result2.type === "unavailable") {
      return result2;
    }

    const { selectedText, range } = result.data;
    const { language, filename } = result2.data;

    return {
      type: "success",
      conversation: new GenerateTestConversation(
        {
          id: conversationId,
          filename,
          range,
          selectedText,
          language,
        },
        {
          openAIClient,
          updateChatPanel,
        }
      ),
      shouldImmediatelyAnswer: true,
    };
  }

  readonly filename: string;
  readonly range: vscode.Range;
  readonly selectedText: string;
  readonly language: string | undefined;

  testContent: string | undefined;
  testDocument: vscode.TextDocument | undefined;
  testEditor: vscode.TextEditor | undefined;

  constructor(
    {
      id,
      filename,
      range,
      selectedText,
      language,
    }: {
      id: string;
      filename: string;
      range: vscode.Range;
      selectedText: string;
      language: string | undefined;
    },
    {
      openAIClient,
      updateChatPanel,
    }: {
      openAIClient: OpenAIClient;
      updateChatPanel: () => Promise<void>;
    }
  ) {
    super({
      id,
      initialState: {
        type: "waitingForBotAnswer",
        botAction: "Generating test",
      },
      openAIClient,
      updateChatPanel,
      initVariables: {},
    });

    this.filename = filename;
    this.range = range;
    this.selectedText = selectedText;
    this.language = language;
  }

  async getTitle() {
    return `Generate Test (${this.filename} ${this.range.start.line}:${this.range.end.line})`;
  }

  isTitleMessage(): boolean {
    return false;
  }

  getCodicon(): string {
    return "beaker";
  }

  private async updateEditor() {
    const testContent = this.testContent;

    if (testContent == undefined) {
      return;
    }

    // introduce local variable to ensure that testDocument is defined:
    const testDocument =
      this.testDocument ??
      (await vscode.workspace.openTextDocument({
        language: this.language,
        content: testContent,
      }));

    this.testDocument = testDocument;

    if (this.testEditor == undefined) {
      this.testEditor = await vscode.window.showTextDocument(
        testDocument,
        vscode.ViewColumn.Beside
      );
    } else {
      this.testEditor.edit((edit: vscode.TextEditorEdit) => {
        edit.replace(
          new vscode.Range(
            testDocument.positionAt(0),
            testDocument.positionAt(testDocument.getText().length - 1)
          ),
          testContent
        );
      });
    }
  }

  async executeGenerateTest(userMessage?: string) {
    const completion =
      userMessage != undefined && this.testContent != null
        ? await generateRefineCodeCompletion({
            code: this.testContent,
            instruction: userMessage,
            openAIClient: this.openAIClient,
          })
        : await generateGenerateTestCompletion({
            selectedText: this.selectedText,
            openAIClient: this.openAIClient,
          });

    if (completion.type === "error") {
      await this.setErrorStatus({ errorMessage: completion.errorMessage });
      return;
    }

    this.testContent = completion.content?.trim();

    await this.addBotMessage({
      content: userMessage != undefined ? "Test updated." : "Test generated.",
      responsePlaceholder: "Instruct how to refine the test…",
    });

    await this.updateEditor();
  }

  async retry() {
    const userMessages = this.messages.filter(
      (message) => message.author === "user"
    );

    const userMessage = userMessages[userMessages.length - 1]?.content;

    this.state = {
      type: "waitingForBotAnswer",
      botAction: userMessage != undefined ? "Test updated." : "Test generated.",
    };
    await this.updateChatPanel();

    await this.executeGenerateTest(userMessage);
  }

  async answer(userMessage?: string) {
    if (userMessage != undefined) {
      await this.addUserMessage({
        content: userMessage,
        botAction: "Updating Test",
      });
    }

    await this.executeGenerateTest(userMessage);
  }
}
