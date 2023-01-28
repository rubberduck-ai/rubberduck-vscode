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
      initialState: { type: "userCanReply" },
      openAIClient,
      updateChatPanel,
    });

    this.selectedText = selectedText;
  }

  getTrigger() {
    return { type: "startChat" } as const;
  }

  async answer(userMessage?: string) {
    if (userMessage != undefined) {
      await this.addUserMessage({ content: userMessage });
    }

    await this.addBotMessage({
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
