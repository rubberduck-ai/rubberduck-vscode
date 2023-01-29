import { OpenAIClient } from "../openai/OpenAIClient";
import { ConversationModel } from "./ConversationModel";

export type ConversationModelFactoryResult =
  | {
      result: "success";
      conversation: ConversationModel;
      shouldImmediatelyAnswer: boolean;
    }
  | {
      result: "unavailable";
    };

export type ConversationModelFactory = {
  id: string;
  createConversationModel({
    generateChatId,
    openAIClient,
    updateChatPanel,
  }: {
    generateChatId(): string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
  }): Promise<ConversationModelFactoryResult>;
};
