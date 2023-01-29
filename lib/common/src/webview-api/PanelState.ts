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
      filename: zod.string(),
      diff: zod.string(),
    }),
  ])
  .optional();

export type PanelState = zod.infer<typeof panelStateSchema>;
