import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
import { ConversationModel } from "./ConversationModel";
import { generateGenerateTestCompletion } from "./generateGenerateTestCompletion";
import { generateRefineCodeCompletion } from "./generateRefineCodeCompletion";

export class GenerateTestConversationModel extends ConversationModel {
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
    });

    this.filename = filename;
    this.range = range;
    this.selectedText = selectedText;
    this.language = language;
  }

  getTrigger() {
    return {
      type: "generateTest",
      selection: {
        filename: this.filename,
        startLine: this.range.start.line,
        endLine: this.range.end.line,
        text: this.selectedText,
      },
    } as const;
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

  async answer(userMessage?: string) {
    if (userMessage != undefined) {
      await this.addUserMessage({
        content: userMessage,
        botAction: "Updating Test",
      });
    }

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

    this.testContent = completion.content;

    await this.addBotMessage({
      content: userMessage != undefined ? "Test updated." : "Test generated.",
      responsePlaceholder: "Instruct how to refine the test…",
    });

    await this.updateEditor();
  }
}
