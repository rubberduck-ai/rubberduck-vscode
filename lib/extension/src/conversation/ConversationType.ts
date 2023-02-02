import { DiffEditorManager } from "../diff/DiffEditorManager";
import { OpenAIClient } from "../openai/OpenAIClient";
import { Conversation } from "./Conversation";

export type CreateConversationResult =
  | {
      result: "success";
      conversation: Conversation;
      shouldImmediatelyAnswer: boolean;
    }
  | {
      result: "unavailable";
      type?: undefined;
    }
  | {
      result: "unavailable";
      type: "info" | "error";
      message: string;
    };

export type ConversationType = {
  readonly id: string;

  readonly inputs: Array<string>;

  createConversation({
    conversationId,
    openAIClient,
    updateChatPanel,
    diffEditorManager,
    initData,
  }: {
    conversationId: string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
    diffEditorManager: DiffEditorManager;
    initData: Map<string, unknown>;
  }): Promise<CreateConversationResult>;
};
