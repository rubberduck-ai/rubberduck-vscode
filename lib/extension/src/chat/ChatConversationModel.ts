import { OpenAIClient } from "../openai/OpenAIClient";
import { CodeSection } from "../prompt/CodeSection";
import { ConversationModel } from "./ConversationModel";
import { ConversationModelFactoryResult } from "./ConversationModelFactory";
import { generateChatCompletion } from "./generateChatCompletion";
import { getCompositeInput } from "./getCompositeInput";
import { getOptionalSelectedText } from "./getOptionalSelectedText";

export class ChatConversationModel extends ConversationModel {
  static id = "chat";

  static async createConversationModel({
    generateChatId,
    openAIClient,
    updateChatPanel,
  }: {
    generateChatId: () => string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
  }): Promise<ConversationModelFactoryResult> {
    const result = await getCompositeInput({
      optionalSelectedText: getOptionalSelectedText,
    })();

    if (result.result === "unavailable") {
      return result;
    }

    return {
      result: "success",
      conversation: new ChatConversationModel(
        {
          id: generateChatId(),
          initData: result.data,
        },
        {
          openAIClient,
          updateChatPanel,
        }
      ),
      shouldImmediatelyAnswer: false,
    };
  }

  constructor(
    {
      id,
      initData,
    }: {
      id: string;
      initData: Map<string, unknown>;
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
      initData,
    });
  }

  getTitle(): string {
    return this.messages[0]?.content ?? "New Chat";
  }

  isTitleMessage(): boolean {
    return this.messages.length > 0;
  }

  getCodicon(): string {
    return "comment-discussion";
  }

  private async executeChat() {
    const selectedText = this.initData.get("optionalSelectedText") as
      | string
      | undefined;

    const completion = await generateChatCompletion({
      introSections:
        selectedText != null
          ? [
              new CodeSection({
                title: "Selected Code",
                code: selectedText,
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
      content: completion.content.trim(),
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
