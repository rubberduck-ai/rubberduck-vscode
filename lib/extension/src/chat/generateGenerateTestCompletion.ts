import { OpenAIClient } from "../openai/OpenAIClient";
import { CodeSection } from "../prompt/CodeSection";
import { LinesSection } from "../prompt/LinesSection";
import { NullSection } from "../prompt/NullSection";
import { assemblePrompt } from "../prompt/Prompt";

export async function generateGenerateTestCompletion({
  selectedText,
  userMessages,
  maxTokens = 2048,
  openAIClient,
}: {
  selectedText: string;
  userMessages: string[];
  maxTokens?: number;
  openAIClient: OpenAIClient;
}) {
  return (
    await openAIClient.generateCompletion({
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
          userMessages.length > 0
            ? new LinesSection({
                title: "Additional Instructions",
                lines: userMessages,
              })
            : new NullSection(),
          new LinesSection({
            title: "Answer",
            lines: ["```"],
          }),
        ],
      }),
      maxTokens,
      stop: ["```"],
    })
  ).trim();
}
