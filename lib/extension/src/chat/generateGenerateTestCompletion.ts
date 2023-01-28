import { OpenAIClient } from "../openai/OpenAIClient";
import { CodeSection } from "../prompt/CodeSection";
import { LinesSection } from "../prompt/LinesSection";
import { assemblePrompt } from "../prompt/Prompt";

export async function generateGenerateTestCompletion({
  selectedText,
  maxTokens = 1536,
  openAIClient,
}: {
  selectedText: string;
  maxTokens?: number;
  openAIClient: OpenAIClient;
}) {
  return openAIClient.generateCompletion({
    prompt: assemblePrompt({
      sections: [
        new LinesSection({
          title: "Instructions",
          lines: ["Write a unit test for the code below."],
        }),
        new CodeSection({
          code: selectedText,
        }),
        new LinesSection({
          title: "Task",
          lines: [
            "Write a unit test that contains test cases for the happy path and for all edge cases.",
          ],
        }),

        new LinesSection({
          title: "Answer",
          lines: ["```"],
        }),
      ],
    }),
    maxTokens,
    stop: ["```"],
  });
}
