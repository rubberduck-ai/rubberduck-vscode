import { webviewApi } from "@rubberduck/common";
import Handlebars from "handlebars";
import * as vscode from "vscode";
import { DiffEditor } from "../diff/DiffEditor";
import { DiffEditorManager } from "../diff/DiffEditorManager";
import { OpenAIClient } from "../openai/OpenAIClient";
import { DiffData } from "./DiffData";
import { resolveVariables } from "./input/resolveVariables";
import {
  ConversationTemplate,
  MessageProcessor,
} from "./template/ConversationTemplate";

Handlebars.registerHelper({
  eq: (v1, v2) => v1 === v2,
  neq: (v1, v2) => v1 !== v2,
  lt: (v1, v2) => v1 < v2,
  gt: (v1, v2) => v1 > v2,
  lte: (v1, v2) => v1 <= v2,
  gte: (v1, v2) => v1 >= v2,
});

export class Conversation {
  readonly id: string;
  protected readonly openAIClient: OpenAIClient;
  protected state: webviewApi.Conversation["state"];
  protected readonly messages: webviewApi.Message[];
  protected readonly updateChatPanel: () => Promise<void>;

  protected readonly initVariables: Record<string, unknown>;

  private readonly template: ConversationTemplate;

  temporaryEditorContent: string | undefined;
  temporaryEditorDocument: vscode.TextDocument | undefined;
  temporaryEditor: vscode.TextEditor | undefined;

  diffContent: string | undefined;
  diffEditor: DiffEditor | undefined;
  diffData: DiffData | undefined;
  private readonly diffEditorManager: DiffEditorManager;

  constructor({
    id,
    initVariables,
    openAIClient,
    updateChatPanel,
    template,
    diffEditorManager,
    diffData,
  }: {
    id: string;
    initVariables: Record<string, unknown>;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
    template: ConversationTemplate;
    diffEditorManager: DiffEditorManager;
    diffData: DiffData | undefined;
  }) {
    this.id = id;
    this.openAIClient = openAIClient;
    this.updateChatPanel = updateChatPanel;
    this.messages = [];
    this.initVariables = initVariables;

    this.template = template;
    this.diffEditorManager = diffEditorManager;
    this.diffData = diffData;

    this.state =
      template.type === "basic-chat"
        ? { type: "userCanReply" }
        : {
            type: "waitingForBotAnswer",
            botAction: template.analysis.placeholder ?? "Answering",
          };
  }

  async getTitle() {
    const header = this.template.header;

    try {
      const firstMessageContent = this.messages[0]?.content;

      if (
        header.useFirstMessageAsTitle === true &&
        firstMessageContent != null
      ) {
        return firstMessageContent;
      }

      return await this.evaluateTemplate(header.title);
    } catch (error: unknown) {
      console.error(error);
      return header.title; // not evaluated
    }
  }

  isTitleMessage(): boolean {
    return this.template.header.useFirstMessageAsTitle ?? false
      ? this.messages.length > 0
      : false;
  }

  getCodicon(): string {
    return this.template.header.icon.value;
  }

  private async evaluateTemplate(template: string): Promise<string> {
    const variables = await resolveVariables(this.template.variables, {
      time: "message",
      messages: this.messages,
    });

    // special variable: temporaryEditorContent
    if (this.temporaryEditorContent != undefined) {
      variables.temporaryEditorContent = this.temporaryEditorContent;
    }

    return Handlebars.compile(template, {
      noEscape: true,
    })({
      ...this.initVariables,
      ...variables,
    });
  }

  private async executeChat() {
    try {
      const messageProcessor =
        this.template.type === "basic-chat"
          ? this.template.chat
          : this.messages[0] == null
          ? this.template.analysis
          : this.template.chat;

      const prompt = messageProcessor.prompt;

      const completion = await this.openAIClient.generateCompletion({
        prompt: await this.evaluateTemplate(prompt.template),
        maxTokens: prompt.maxTokens,
        stop: prompt.stop,
        temperature: prompt.temperature,
      });

      if (completion.type === "error") {
        await this.setErrorStatus({ errorMessage: completion.errorMessage });
        return;
      }

      await this.handleCompletion(completion.content, messageProcessor);
    } catch (error: any) {
      console.log(error);
      await this.setErrorStatus({
        errorMessage: error?.message ?? "Unknown error",
      });
    }
  }

  private async handleCompletion(
    completionContent: string,
    messageProcessor: MessageProcessor
  ) {
    const completionHandler = messageProcessor.completionHandler;

    if (completionHandler == undefined) {
      await this.addBotMessage({
        content: completionContent.trim(),
      });
      return;
    }

    const completionHandlerType = completionHandler.type;

    switch (completionHandlerType) {
      case "update-temporary-editor": {
        this.temporaryEditorContent = completionContent.trim();

        await this.addBotMessage({
          content: completionHandler.botMessage,
        });

        const language = completionHandler.language;

        await this.updateTemporaryEditor(
          language != null ? await this.evaluateTemplate(language) : undefined
        );
        break;
      }
      case "active-editor-diff": {
        this.diffContent = completionContent.trim();

        await this.addBotMessage({
          content: "Edit generated",
          responsePlaceholder: "Describe how you want to change the code…",
        });

        await this.updateDiff();

        break;
      }
      case "message": {
        await this.addBotMessage({
          content: completionContent.trim(),
        });
        break;
      }
      default: {
        const exhaustiveCheck: never = completionHandlerType;
        throw new Error(`unsupported property: ${exhaustiveCheck}`);
      }
    }
  }

  private async updateTemporaryEditor(language: string | undefined) {
    const temporaryEditorContent = this.temporaryEditorContent;

    if (temporaryEditorContent == undefined) {
      return;
    }

    // introduce local variable to ensure that testDocument is defined:
    const temporaryEditorDocument =
      this.temporaryEditorDocument ??
      (await vscode.workspace.openTextDocument({
        language,
        content: temporaryEditorContent,
      }));

    this.temporaryEditorDocument = temporaryEditorDocument;

    if (this.temporaryEditor == undefined) {
      this.temporaryEditor = await vscode.window.showTextDocument(
        temporaryEditorDocument
      );
    } else {
      this.temporaryEditor.edit((edit: vscode.TextEditorEdit) => {
        edit.replace(
          new vscode.Range(
            temporaryEditorDocument.positionAt(0),
            temporaryEditorDocument.positionAt(
              temporaryEditorDocument.getText().length - 1
            )
          ),
          temporaryEditorContent
        );
      });
    }
  }

  private async updateDiff() {
    const editContent = this.diffContent;
    const diffData = this.diffData;

    if (editContent == undefined || diffData == undefined) {
      return;
    }

    // edit the file content with the editContent:
    const document = diffData.editor.document;
    const originalContent = document.getText();
    const prefix = originalContent.substring(
      0,
      document.offsetAt(diffData.range.start)
    );
    const suffix = originalContent.substring(
      document.offsetAt(diffData.range.end)
    );

    // calculate the minimum number of leading whitespace characters per line in the selected text:
    const minLeadingWhitespace = diffData.selectedText
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

    if (this.diffEditor == undefined) {
      this.diffEditor = this.diffEditorManager.createDiffEditor({
        filename: diffData.filename,
        editorColumn: diffData.editor.viewColumn ?? vscode.ViewColumn.One,
        conversationId: this.id,
      });
    }

    this.diffEditor.onDidReceiveMessage(async (rawMessage) => {
      const message = webviewApi.outgoingMessageSchema.parse(rawMessage);
      if (message.type !== "applyDiff") {
        return;
      }

      const edit = new vscode.WorkspaceEdit();
      edit.replace(
        document.uri,
        diffData.range,
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

    await this.diffEditor.updateDiff({
      oldCode: originalContent,
      newCode: editedFileContent,
      languageId: document.languageId,
    });
  }

  async retry() {
    this.state = { type: "waitingForBotAnswer" };
    await this.updateChatPanel();

    await this.executeChat();
  }

  async answer(userMessage?: string) {
    if (userMessage != undefined) {
      await this.addUserMessage({ content: userMessage });
    }

    await this.executeChat();
  }

  protected async addUserMessage({
    content,
    botAction,
  }: {
    content: string;
    botAction?: string;
  }) {
    this.messages.push({ author: "user", content });
    this.state = { type: "waitingForBotAnswer", botAction };
    await this.updateChatPanel();
  }

  protected async addBotMessage({
    content,
    responsePlaceholder,
  }: {
    content: string;
    responsePlaceholder?: string;
  }) {
    this.messages.push({ author: "bot", content });
    this.state = { type: "userCanReply", responsePlaceholder };
    await this.updateChatPanel();
  }

  protected async setErrorStatus({ errorMessage }: { errorMessage: string }) {
    this.state = { type: "error", errorMessage };
    await this.updateChatPanel();
  }

  async toWebviewConversation(): Promise<webviewApi.Conversation> {
    return {
      id: this.id,
      header: {
        title: await this.getTitle(),
        isTitleMessage: this.isTitleMessage(),
        codicon: this.getCodicon(),
      },
      messages: this.isTitleMessage() ? this.messages.slice(1) : this.messages,
      state: this.state,
    };
  }
}
