import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
import { BasicSection } from "../prompt/BasicSection";
import { CodeSection } from "../prompt/CodeSection";
import { LinesSection } from "../prompt/LinesSection";
import { assemblePrompt } from "../prompt/Prompt";
import { ConversationModel } from "./ConversationModel";
import { ConversationModelFactoryResult } from "./ConversationModelFactory";
import { generateChatCompletion } from "./generateChatCompletion";
import {
  ErrorInRange,
  getErrorsInSelectionRange,
} from "./getErrorsInSelectionRange";
import { getFileInformation } from "./getFileInformation";

function annotateSelectionWithErrors({
  selectionText,
  selectionStartLine,
  errors,
}: {
  selectionText: string;
  selectionStartLine: number;
  errors: Array<ErrorInRange>;
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
    const result = await getErrorsInSelectionRange();
    const result2 = await getFileInformation();

    if (result.result === "unavailable") {
      return result;
    }
    if (result2.result === "unavailable") {
      return result2;
    }

    const { errors, range, rangeText } = result.data;
    const { filename } = result2.data;

    return {
      result: "success",
      conversation: new DiagnoseErrorsConversationModel(
        {
          id: generateChatId(),
          filename,
          range,
          selectedText: rangeText,
          errors,
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
  readonly errors: Array<ErrorInRange>;

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
      errors: Array<ErrorInRange>;
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
      initData: new Map(),
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
