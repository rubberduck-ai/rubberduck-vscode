import { webviewApi } from "@rubberduck/common";
import { OpenAIClient } from "../openai/OpenAIClient";
import { ConversationSection } from "../prompt/ConversationSection";
import { LinesSection } from "../prompt/LinesSection";
import { assemblePrompt } from "../prompt/Prompt";
import { Section } from "../prompt/Section";

export async function generateChatCompletion({
  introSections = [],
  messages,
  botRole = "Bot",
  userRole = "Developer",
  maxTokens = 1024,
  openAIClient,
}: {
  introSections?: Section[];
  messages: webviewApi.Message[];
  botRole?: string;
  userRole?: string;
  maxTokens?: number;
  openAIClient: OpenAIClient;
}) {
  const lastMessage = messages[messages.length - 1];

  return openAIClient.generateCompletion({
    prompt: assemblePrompt({
      sections: [
        new LinesSection({
          title: "Instructions",
          lines: [
            "Continue the conversation below.",
            "Pay special attention to the current ${userRole.toLocaleLowerCase()} request.",
          ],
        }),
        new LinesSection({
          title: "Current request",
          lines: [`${userRole}: ${lastMessage}`],
        }),
        ...introSections,
        new ConversationSection({
          messages,
        }),
        new LinesSection({
          title: "Task",
          lines: [
            "Write a response that continues the conversation.",
            `Stay focused on current ${userRole.toLocaleLowerCase()} request.`,
            "Consider the possibility that there might not be a solution.",
            "Ask for clarification if the message does not make sense or more input is needed.",
            "Use the style of a documentation article.",
            "Omit any links.",
            "Include code snippets (using Markdown) and examples where appropriate.",
          ],
        }),
        new LinesSection({
          title: "Response",
          lines: [`${botRole}:`],
        }),
      ],
    }),
    maxTokens,
    stop: [`${botRole}:`, `${userRole}:`],
  });
}
