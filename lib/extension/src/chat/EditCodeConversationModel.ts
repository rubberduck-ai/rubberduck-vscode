import { webviewApi } from "@rubberduck/common";
import { createDiff } from "@rubberduck/diff";
import * as vscode from "vscode";
import { DiffEditor } from "../diff/DiffEditor";
import { DiffEditorManager } from "../diff/DiffEditorManager";
import { OpenAIClient } from "../openai/OpenAIClient";
import { CodeSection } from "../prompt/CodeSection";
import { LinesSection } from "../prompt/LinesSection";
import { assemblePrompt } from "../prompt/Prompt";
import { ConversationModel } from "./ConversationModel";
import { ConversationModelFactoryResult } from "./ConversationModelFactory";
import { getCompositeInput } from "./getCompositeInput";
import { FileInformationData, getFileInformation } from "./getFileInformation";
import {
  getRequiredSelectedText,
  RequiredSelectedTextData,
} from "./getRequiredSelectedText";

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
    const result = await getCompositeInput({
      requiredSelectedText: getRequiredSelectedText,
      fileInformation: getFileInformation,
    })();

    if (result.result === "unavailable") {
      return result;
    }

    return {
      result: "success",
      conversation: new EditCodeConversationModel(
        {
          id: generateChatId(),
          data: result.data,
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
      data,
    }: {
      id: string;
      data: Map<string, unknown>;
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

    const { selectedText, range } = data.get(
      "requiredSelectedText"
    ) as RequiredSelectedTextData;

    const { filename, language, activeEditor } = data.get(
      "fileInformation"
    ) as FileInformationData;

    this.filename = filename;
    this.range = range;
    this.selectedText = selectedText;
    this.language = language;
    this.diffEditorManager = diffEditorManager;
    this.editor = activeEditor;
  }

  getTitle(): string {
    return `${this.messages[0]?.content ?? "Edit Code"} (${this.filename} ${
      this.range.start.line
    }:${this.range.end.line})`;
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
    const document = this.editor.document;
    const originalContent = document.getText();
    const prefix = originalContent.substring(
      0,
      document.offsetAt(this.range.start)
    );
    const suffix = originalContent.substring(document.offsetAt(this.range.end));

    // calculate the minimum number of leading whitespace characters per line in the selected text:
    const minLeadingWhitespace = this.selectedText
      .split("\n")
      .map((line) => line.match(/^\s*/)?.[0] ?? "")
      .filter((line) => line.length > 0)
      .reduce((min, line) => Math.min(min, line.length), Infinity);

    // calculate the minimum number of leading whitespace characters per line in the new text:
    const minLeadingWhitespaceNew = editContent
      .split("\n")
      .map((line) => line.match(/^\s*/)?.[0] ?? "")
      .filter((line) => line.length > 0)
      .reduce((min, line) => Math.min(min, line.length), Infinity);

    // add leading whitespace to each line in the new text to match the original text:
    const editContentWithAdjustedWhitespace = editContent
      .split("\n")
      .map((line) => {
        const leadingWhitespace = line.match(/^\s*/)?.[0] ?? "";
        const relativeIndent =
          leadingWhitespace.length - minLeadingWhitespaceNew;
        const newIndent = Math.max(0, minLeadingWhitespace + relativeIndent);
        return (
          (newIndent < Infinity ? " ".repeat(newIndent) : "") +
          line.substring(leadingWhitespace.length)
        );
      })
      .join("\n");

    // diff the original file content with the edited file content:
    const editedFileContent = `${prefix}${editContentWithAdjustedWhitespace}${suffix}`;
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
        conversationId: this.id,
      });

      this.diffEditor.onDidReceiveMessage(async (rawMessage) => {
        const message = webviewApi.outgoingMessageSchema.parse(rawMessage);
        if (message.type !== "applyDiff") {
          return;
        }

        const edit = new vscode.WorkspaceEdit();
        edit.replace(
          document.uri,
          this.range,
          editContentWithAdjustedWhitespace
        );
        await vscode.workspace.applyEdit(edit);

        const tabGroups = vscode.window.tabGroups;
        const allTabs: vscode.Tab[] = tabGroups.all
          .map((tabGroup) => tabGroup.tabs)
          .flat();

        const tab = allTabs.find((tab) => {
          return (
            (tab.input as any).viewType ===
            `mainThreadWebview-rubberduck.diff.${this.id}`
          );
        });

        if (tab != undefined) {
          await tabGroups.close(tab);
        }

        this.diffEditor = undefined;
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
            lines: [`Edit the code below as follows:`, ...instructions],
          }),
          new CodeSection({
            title: "Code",
            code: this.selectedText,
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
