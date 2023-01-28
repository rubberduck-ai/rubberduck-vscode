import { OpenAIClient } from "../openai/OpenAIClient";
import { ConversationModel } from "./ConversationModel";
import { generateChatCompletion } from "./generateChatCompletion";

export class FreeConversationModel extends ConversationModel {
  constructor(
    { id }: { id: string },
    { openAIClient }: { openAIClient: OpenAIClient }
  ) {
    super({ id, openAIClient, initialState: { type: "userCanReply" } });
  }

  getTrigger() {
    return { type: "startChat" } as const;
  }

  async answer() {
    this.addBotMessage({
      content: await generateChatCompletion({
        messages: this.messages,
        openAIClient: this.openAIClient,
      }),
    });
  }
}
