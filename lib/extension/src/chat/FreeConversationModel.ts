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

  private async executeChat() {
    const completion = await generateChatCompletion({
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

    await this.executeChat();
  }

  async answer(userMessage?: string) {
    if (userMessage != undefined) {
      await this.addUserMessage({ content: userMessage });
    }

    await this.executeChat();
  }
}
