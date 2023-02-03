import { DiffEditorManager } from "../diff/DiffEditorManager";
import { OpenAIClient } from "../openai/OpenAIClient";
import { Conversation } from "./Conversation";

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
  readonly inputs: Array<string>;

  areInitVariableRequirementsSatisfied(initData: Map<string, unknown>): boolean;

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
