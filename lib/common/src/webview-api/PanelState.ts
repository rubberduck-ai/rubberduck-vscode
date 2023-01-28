import zod from "zod";
import { conversationSchema } from "./Conversation";

export const panelStateSchema = zod.union([
  zod.object({
    conversations: zod.array(conversationSchema),
    selectedConversationIndex: zod.union([zod.number(), zod.undefined()]),
  }),
  zod.undefined(),
]);

export type PanelState = zod.infer<typeof panelStateSchema>;
