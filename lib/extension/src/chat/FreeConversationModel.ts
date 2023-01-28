import { OpenAIClient } from "../openai/OpenAIClient";
import { CodeSection } from "../prompt/CodeSection";
import { ConversationModel } from "./ConversationModel";
import { generateChatCompletion } from "./generateChatCompletion";

export class FreeConversationModel extends ConversationModel {
  readonly selectedText: string | undefined;

  constructor(
    {
      id,
      selectedText,
    }: {
      id: string;
      selectedText?: string | undefined;
    },
    { openAIClient }: { openAIClient: OpenAIClient }
  ) {
    super({ id, openAIClient, initialState: { type: "userCanReply" } });

    this.selectedText = selectedText;
  }

  getTrigger() {
    return { type: "startChat" } as const;
  }

  async answer() {
    this.addBotMessage({
      content: await generateChatCompletion({
        introSections:
          this.selectedText != null
            ? [
                new CodeSection({
                  title: "Selected Code",
                  code: this.selectedText,
                }),
              ]
            : [],
        messages: this.messages,
        openAIClient: this.openAIClient,
      }),
    });
  }
}
