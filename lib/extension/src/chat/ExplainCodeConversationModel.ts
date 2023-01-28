import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
import { CodeSection } from "../prompt/CodeSection";
import { LinesSection } from "../prompt/LinesSection";
import { ConversationModel } from "./ConversationModel";
import { generateChatCompletion } from "./generateChatCompletion";
import { generateExplainCodeCompletion } from "./generateExplainCodeCompletion";

export class ExplainCodeConversationModel extends ConversationModel {
  readonly filename: string;
  readonly range: vscode.Range;
  readonly selectedText: string;

  constructor(
    {
      id,
      filename,
      range,
      selectedText,
    }: {
      id: string;
      filename: string;
      range: vscode.Range;
      selectedText: string;
    },
    { openAIClient }: { openAIClient: OpenAIClient }
  ) {
    super({
      id,
      openAIClient,
      initialState: {
        type: "waitingForBotAnswer",
        botAction: "Generating explanation",
      },
    });

    this.filename = filename;
    this.range = range;
    this.selectedText = selectedText;
  }

  getTrigger() {
    return {
      type: "explainCode",
      selection: {
        filename: this.filename,
        startLine: this.range.start.line,
        endLine: this.range.end.line,
        text: this.selectedText,
      },
    } as const;
  }

  async answer() {
    if (this.state.type !== "waitingForBotAnswer") {
      return;
    }

    this.addBotMessage({
      content:
        this.messages.length === 0
          ? await generateExplainCodeCompletion({
              selectedText: this.selectedText,
              openAIClient: this.openAIClient,
            })
          : await generateChatCompletion({
              introSections: [
                new CodeSection({
                  code: this.selectedText,
                }),
                new LinesSection({
                  title: "Code Summary",
                  lines: [this.messages[0].content],
                }),
              ],
              messages: this.messages.slice(1),
              openAIClient: this.openAIClient,
            }),
    });
  }
}
