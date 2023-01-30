import zod from "zod";
import { conversationSchema } from "./Conversation";

export const panelStateSchema = zod
  .discriminatedUnion("type", [
    zod.object({
      type: zod.literal("chat"),
      conversations: zod.array(conversationSchema),
      selectedConversationIndex: zod.union([zod.number(), zod.undefined()]),
    }),
    zod.object({
      type: zod.literal("diff"),
      originalContent: zod.string(),
      newContent: zod.string(),
    }),
  ])
  .optional();

export type PanelState = zod.infer<typeof panelStateSchema>;
