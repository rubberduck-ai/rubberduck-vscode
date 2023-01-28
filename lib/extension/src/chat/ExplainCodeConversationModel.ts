import * as vscode from "vscode";
import { OpenAIClient } from "../openai/OpenAIClient";
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
    super({ id, openAIClient, initialState: { type: "waitingForBotAnswer" } });

    this.filename = filename;
    this.range = range;
    this.selectedText = selectedText;
  }

  getTrigger() {
    return {
      type: "explainCode",
      filename: this.filename,
      selectionStartLine: this.range.start.line,
      selectionEndLine: this.range.end.line,
      selection: this.selectedText,
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
              messages: this.messages,
              openAIClient: this.openAIClient,
            }),
    });
  }
}
