import { OpenAIClient } from "../openai/OpenAIClient";
import { BasicSection } from "../prompt/BasicSection";
import { CodeSection } from "../prompt/CodeSection";
import { LinesSection } from "../prompt/LinesSection";
import { assemblePrompt } from "../prompt/Prompt";

export async function generateExplainCodeCompletion({
  selectedText,
  maxTokens = 512,
  openAIClient,
}: {
  selectedText: string;
  maxTokens?: number;
  openAIClient: OpenAIClient;
}) {
  return (
    await openAIClient.generateCompletion({
      prompt: assemblePrompt({
        sections: [
          new LinesSection({
            title: "Instructions",
            lines: [
              "Summarize the code below (emphasizing its key functionality).",
            ],
          }),
          new CodeSection({
            code: selectedText,
          }),
          new LinesSection({
            title: "Task",
            lines: [
              "Summarize the code at a high level (including goal and purpose) with an emphasis on its key functionality.",
            ],
          }),
          new BasicSection({
            title: "Answer",
          }),
        ],
      }),
      maxTokens,
    })
  ).trim();
}
