import { createDiff } from "@rubberduck/diff";
import * as vscode from "vscode";
import { DiffEditor } from "../diff/DiffEditor";
import { DiffEditorManager } from "../diff/DiffEditorManager";
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
    diffEditorManager,
  }: {
    generateChatId: () => string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
    diffEditorManager: DiffEditorManager;
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
          sourceDocument: input.document,
          range: input.range,
          selectedText: input.selectedText,
          language: input.language,
          editor: input.editor,
        },
        {
          openAIClient,
          updateChatPanel,
          diffEditorManager,
        }
      ),
      shouldImmediatelyAnswer: false,
    };
  }

  readonly filename: string;
  readonly sourceDocument: vscode.TextDocument;
  readonly range: vscode.Range;
  readonly selectedText: string;
  readonly language: string | undefined;
  readonly editor: vscode.TextEditor;

  editContent: string | undefined;
  diffEditor: DiffEditor | undefined;

  private readonly diffEditorManager: DiffEditorManager;

  constructor(
    {
      id,
      filename,
      sourceDocument,
      range,
      selectedText,
      language,
      editor,
    }: {
      id: string;
      filename: string;
      sourceDocument: vscode.TextDocument;
      range: vscode.Range;
      selectedText: string;
      language: string | undefined;
      editor: vscode.TextEditor;
    },
    {
      openAIClient,
      updateChatPanel,
      diffEditorManager,
    }: {
      openAIClient: OpenAIClient;
      updateChatPanel: () => Promise<void>;
      diffEditorManager: DiffEditorManager;
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
    this.sourceDocument = sourceDocument;
    this.range = range;
    this.selectedText = selectedText;
    this.language = language;
    this.diffEditorManager = diffEditorManager;
    this.editor = editor;
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

    // edit the file content with the editContent:
    const document = this.sourceDocument;
    const originalContent = document.getText();
    const prefix = originalContent.substring(
      0,
      document.offsetAt(this.range.start)
    );
    const suffix = originalContent.substring(document.offsetAt(this.range.end));
    const editedFileContent = `${prefix}${editContent}${suffix}`;

    // diff the original file content with the edited file content:
    const diff = createDiff({
      filename: this.filename,
      originalContent,
      newContent: editedFileContent,
      contextLines: 3,
    });

    if (this.diffEditor == undefined) {
      const targetColumn =
        this.editor.viewColumn === vscode.ViewColumn.One
          ? vscode.ViewColumn.Two
          : vscode.ViewColumn.One;

      this.diffEditor = this.diffEditorManager.createDiffEditor({
        filename: this.filename,
        editorColumn: targetColumn,
      });
    }

    await this.diffEditor.updateDiff(diff);
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
            lines: [`Edit the current code below as follows:`, ...instructions],
          }),
          new CodeSection({
            title: "Current Code",
            code: this.selectedText,
          }),
          new LinesSection({
            title: "Task",
            lines: [
              `Edit the current code as follows:`,
              ...instructions,
              "Preserve the indentation level.",
            ],
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

    this.editContent = completion.content.trim();

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
