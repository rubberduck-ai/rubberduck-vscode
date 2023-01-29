import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
import { CodeSection } from "../prompt/CodeSection";
import { LinesSection } from "../prompt/LinesSection";
import { assemblePrompt } from "../prompt/Prompt";
import { getActiveEditorSelectionInput } from "../vscode/getActiveEditorSelectionInput";
import { ConversationModel } from "./ConversationModel";
import { ConversationModelFactoryResult } from "./ConversationModelFactory";

export class EditCodeConversationModel extends ConversationModel {
  static id = "editCode";

  static async createConversationModel({
    generateChatId,
    openAIClient,
    updateChatPanel,
  }: {
    generateChatId: () => string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
  }): Promise<ConversationModelFactoryResult> {
    const input = getActiveEditorSelectionInput();

    if (input == undefined) {
      return {
        result: "unavailable",
      };
    }

    return {
      result: "success",
      conversation: new EditCodeConversationModel(
        {
          id: generateChatId(),
          filename: input.filename,
          range: input.range,
          selectedText: input.selectedText,
          language: input.language,
        },
        {
          openAIClient,
          updateChatPanel,
        }
      ),
      shouldImmediatelyAnswer: false,
    };
  }

  readonly filename: string;
  readonly range: vscode.Range;
  readonly selectedText: string;
  readonly language: string | undefined;

  editContent: string | undefined;
  editDocument: vscode.TextDocument | undefined;
  editEditor: vscode.TextEditor | undefined;

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
        type: "userCanReply",
        responsePlaceholder: "Describe how you want to change the code…",
      },
      openAIClient,
      updateChatPanel,
    });

    this.filename = filename;
    this.range = range;
    this.selectedText = selectedText;
    this.language = language;
  }

  getTitle(): string {
    return `${
      this.messages.length === 0 ? "Edit Code" : this.messages[0].content
    } (${this.filename} ${this.range.start.line}:${this.range.end.line})`;
  }

  isTitleMessage(): boolean {
    return this.messages.length > 0;
  }

  getCodicon(): string {
    return "edit";
  }

  private async updateEditor() {
    const editContent = this.editContent;

    if (editContent == undefined) {
      return;
    }

    // introduce local variable to ensure that editDocument is defined:
    const editDocument =
      this.editDocument ??
      (await vscode.workspace.openTextDocument({
        language: this.language,
        content: editContent,
      }));

    this.editDocument = editDocument;

    if (this.editEditor == undefined) {
      this.editEditor = await vscode.window.showTextDocument(
        editDocument,
        vscode.ViewColumn.Beside
      );
    } else {
      this.editEditor.edit((edit: vscode.TextEditorEdit) => {
        edit.replace(
          new vscode.Range(
            editDocument.positionAt(0),
            editDocument.positionAt(editDocument.getText().length - 1)
          ),
          editContent
        );
      });
    }
  }

  private async executeEditCode() {
    const instructions = this.messages
      .filter((message) => message.author === "user")
      .map((message) => message.content);

    const completion = await this.openAIClient.generateCompletion({
      prompt: assemblePrompt({
        sections: [
          new LinesSection({
            title: "Instructions",
            lines: [`Rewrite the code below as follows:`, ...instructions],
          }),
          new CodeSection({
            code: this.selectedText,
          }),
          new LinesSection({
            title: "Task",
            lines: [`Rewrite the code as follows:`, ...instructions],
          }),
          new LinesSection({
            title: "Answer",
            lines: ["```"],
          }),
        ],
      }),
      maxTokens: 1536,
      stop: ["```"],
    });

    if (completion.type === "error") {
      await this.setErrorStatus({ errorMessage: completion.errorMessage });
      return;
    }

    this.editContent = completion.content;

    await this.addBotMessage({
      content: "Edit generated",
      responsePlaceholder: "Describe how you want to change the code…",
    });

    await this.updateEditor();
  }

  async retry() {
    this.state = { type: "waitingForBotAnswer", botAction: "Generating edit" };
    await this.updateChatPanel();

    await this.executeEditCode();
  }

  async answer(userMessage?: string) {
    if (userMessage != undefined) {
      await this.addUserMessage({
        content: userMessage,
        botAction: "Generating edit",
      });
    }

    await this.executeEditCode();
  }
}
