import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
import { BasicSection } from "../prompt/BasicSection";
import { CodeSection } from "../prompt/CodeSection";
import { LinesSection } from "../prompt/LinesSection";
import { assemblePrompt } from "../prompt/Prompt";
import { getActiveEditor } from "../vscode/getActiveEditor";
import { ConversationModel } from "./ConversationModel";
import { ConversationModelFactoryResult } from "./ConversationModelFactory";
import { generateChatCompletion } from "./generateChatCompletion";

type Error = {
  code?: string | number | undefined;
  source?: string | undefined;
  message: string;
  line: number;
};

function annotateSelectionWithErrors({
  selectionText,
  selectionStartLine,
  errors,
}: {
  selectionText: string;
  selectionStartLine: number;
  errors: Array<Error>;
}) {
  return selectionText
    .split("\n")
    .map((line, index) => {
      const actualLineNumber = selectionStartLine + index;
      const lineErrors = errors.filter(
        (error) => error.line === actualLineNumber
      );

      return lineErrors.length === 0
        ? line
        : `${line}
${lineErrors
  .map((error) => `ERROR ${error.source}${error.code}: ${error.message}`)
  .join("\n")}`;
    })
    .join("\n");
}

export class DiagnoseErrorsConversationModel extends ConversationModel {
  static id = "diagnoseErrors";

  static async createConversationModel({
    generateChatId,
    openAIClient,
    updateChatPanel,
  }: {
    generateChatId: () => string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
  }): Promise<ConversationModelFactoryResult> {
    const activeEditor = getActiveEditor();

    if (activeEditor == undefined) {
      return {
        result: "unavailable",
        type: "info",
        message: "No active editor",
      };
    }

    const document = activeEditor.document;
    const range = activeEditor.selection;

    const errors = vscode.languages.getDiagnostics(document.uri).filter(
      (diagnostic) =>
        diagnostic.severity === vscode.DiagnosticSeverity.Error &&
        // line based filtering, because the ranges tend to be to inaccurate:
        diagnostic.range.start.line >= range.start.line &&
        diagnostic.range.end.line <= range.end.line
    );

    const filename = document.fileName.split("/").pop();

    if (filename == undefined || errors.length === 0) {
      return {
        result: "unavailable",
        type: "info",
        message: "No errors found.",
      };
    }

    // get document text between range start line and range end line
    const rangeText = document.getText(
      new vscode.Range(
        new vscode.Position(range.start.line, 0),
        new vscode.Position(range.end.line + 1, 0)
      )
    );

    return {
      result: "success",
      conversation: new DiagnoseErrorsConversationModel(
        {
          id: generateChatId(),
          filename,
          range,
          selectedText: rangeText,
          errors: errors.map((error) => ({
            line: error.range.start.line,
            message: error.message,
            source: error.source,
            code:
              typeof error.code === "object" ? error.code.value : error.code,
          })),
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
  readonly errors: Array<Error>;

  constructor(
    {
      id,
      filename,
      range,
      selectedText,
      errors,
    }: {
      id: string;
      filename: string;
      range: vscode.Range;
      selectedText: string;
      errors: Array<Error>;
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
        botAction: "Diagnosing errors",
      },
      openAIClient,
      updateChatPanel,
    });

    this.filename = filename;
    this.range = range;
    this.selectedText = selectedText;
    this.errors = errors;
  }

  getTitle(): string {
    return `Diagnose Errors (${this.filename} ${this.range.start.line}:${this.range.end.line})`;
  }

  isTitleMessage(): boolean {
    return false;
  }

  getCodicon(): string {
    return "search-fuzzy";
  }

  private async diagnoseErrors() {
    const codeAndErrorsSection = new CodeSection({
      code: annotateSelectionWithErrors({
        selectionText: this.selectedText,
        selectionStartLine: this.range.start.line,
        errors: this.errors,
      }),
    });

    const completion =
      this.messages.length === 0
        ? await this.openAIClient.generateCompletion({
            prompt: assemblePrompt({
              sections: [
                new LinesSection({
                  title: "Instructions",
                  lines: ["Read through the errors in the code below."],
                }),
                codeAndErrorsSection,
                new LinesSection({
                  title: "Task",
                  lines: [
                    "Describe the most likely cause of the error.",
                    "Then describe a potential fix.",
                    "Include code snippets where appropriate.",
                  ],
                }),
                new BasicSection({
                  title: "Answer",
                }),
              ],
            }),
            maxTokens: 512,
          })
        : await generateChatCompletion({
            introSections: [codeAndErrorsSection],
            messages: this.messages,
            openAIClient: this.openAIClient,
          });

    if (completion.type === "error") {
      await this.setErrorStatus({ errorMessage: completion.errorMessage });
      return;
    }

    await this.addBotMessage({
      content: completion.content,
    });
  }

  async retry() {
    this.state = { type: "waitingForBotAnswer" };
    await this.updateChatPanel();

    await this.diagnoseErrors();
  }

  async answer(userMessage?: string) {
    if (userMessage != undefined) {
      await this.addUserMessage({ content: userMessage });
    }

    await this.diagnoseErrors();
  }
}
