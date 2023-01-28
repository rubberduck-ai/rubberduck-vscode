import zod from "zod";

export const messageSchema = zod.object({
  author: zod.union([zod.literal("user"), zod.literal("bot")]),
  content: zod.string(),
});

export type Message = zod.infer<typeof messageSchema>;

export const conversationSchema = zod.object({
  id: zod.string(),
  trigger: zod.discriminatedUnion("type", [
    zod.object({
      type: zod.literal("explainCode"),
      filename: zod.string(),
      selectionStartLine: zod.number(),
      selectionEndLine: zod.number(),
      selection: zod.string(),
    }),
    zod.object({
      type: zod.literal("startChat"),
    }),
  ]),
  messages: zod.array(messageSchema),
  state: zod.discriminatedUnion("type", [
    zod.object({
      type: zod.literal("userCanReply"),
    }),
    zod.object({
      type: zod.literal("waitingForBotAnswer"),
    }),
  ]),
});

export type Conversation = zod.infer<typeof conversationSchema>;
