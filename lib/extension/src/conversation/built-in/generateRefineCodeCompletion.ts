import { OpenAIClient } from "../../openai/OpenAIClient";
import { CodeSection } from "../../prompt/CodeSection";
import { LinesSection } from "../../prompt/LinesSection";
import { assemblePrompt } from "../../prompt/Prompt";

export async function generateRefineCodeCompletion({
  code,
  instruction,
  maxTokens = 1536,
  openAIClient,
}: {
  code: string;
  instruction: string;
  maxTokens?: number;
  openAIClient: OpenAIClient;
}) {
  return openAIClient.generateCompletion({
    prompt: assemblePrompt({
      sections: [
        new LinesSection({
          title: "Instructions",
          lines: [`Rewrite the code below as follows: "${instruction}"`],
        }),
        new CodeSection({
          code,
        }),
        new LinesSection({
          title: "Task",
          lines: [`Rewrite the code as follows: "${instruction}"`],
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
