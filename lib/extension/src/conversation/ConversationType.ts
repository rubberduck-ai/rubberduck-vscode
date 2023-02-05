import { DiffEditorManager } from "../diff/DiffEditorManager";
import { OpenAIClient } from "../openai/OpenAIClient";
import { Conversation } from "./Conversation";
import { ConversationTemplate } from "./template/ConversationTemplate";

export type CreateConversationResult =
  | {
      type: "success";
      conversation: Conversation;
      shouldImmediatelyAnswer: boolean;
    }
  | {
      type: "unavailable";
      display?: undefined;
    }
  | {
      type: "unavailable";
      display: "info" | "error";
      message: string;
    };

export type ConversationType = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly source: "built-in" | "local-workspace";
  readonly variables: ConversationTemplate["variables"];

  createConversation({
    conversationId,
    openAIClient,
    updateChatPanel,
    diffEditorManager,
    initVariables,
  }: {
    conversationId: string;
    openAIClient: OpenAIClient;
    updateChatPanel: () => Promise<void>;
    diffEditorManager: DiffEditorManager;
    initVariables: Record<string, unknown>;
  }): Promise<CreateConversationResult>;
};
