import zod from "zod";

export const selectionSchema = zod.object({
  filename: zod.string(),
  startLine: zod.number(),
  endLine: zod.number(),
  text: zod.string(),
});

export type Selection = zod.infer<typeof selectionSchema>;

export const messageSchema = zod.object({
  author: zod.union([zod.literal("user"), zod.literal("bot")]),
  content: zod.string(),
});

export type Message = zod.infer<typeof messageSchema>;

export const conversationSchema = zod.object({
  id: zod.string(),
  header: zod.object({
    title: zod.string(),
    isTitleMessage: zod.boolean(),
    codicon: zod.string(),
  }),
  messages: zod.array(messageSchema),
  state: zod.discriminatedUnion("type", [
    zod.object({
      type: zod.literal("userCanReply"),
      responsePlaceholder: zod.union([zod.string(), zod.undefined()]),
    }),
    zod.object({
      type: zod.literal("waitingForBotAnswer"),
      botAction: zod.union([zod.string(), zod.undefined()]),
    }),
    zod.object({
      type: zod.literal("botAnswerStreaming"),
      partialAnswer: zod.string(),
    }),
    zod.object({
      type: zod.literal("error"),
      errorMessage: zod.string(),
    }),
  ]),
});

export type Conversation = zod.infer<typeof conversationSchema>;
