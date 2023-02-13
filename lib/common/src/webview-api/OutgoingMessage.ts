import zod from "zod";

export const outgoingMessageSchema = zod.discriminatedUnion("type", [
  zod.object({
    type: zod.literal("startChat"),
  }),
  zod.object({
    type: zod.literal("enterOpenAIApiKey"),
  }),
  zod.object({
    type: zod.literal("clickCollapsedConversation"),
    data: zod.object({
      id: zod.string(),
    }),
  }),
  zod.object({
    type: zod.literal("deleteConversation"),
    data: zod.object({
      id: zod.string(),
    }),
  }),
  zod.object({
    type: zod.literal("sendMessage"),
    data: zod.object({
      id: zod.string(),
      message: zod.string(),
    }),
  }),
  zod.object({
    type: zod.literal("retry"),
    data: zod.object({
      id: zod.string(),
    }),
  }),
  zod.object({
    type: zod.literal("applyDiff"),
  }),
]);

/**
 * A message sent from the webview to the extension.
 */
export type OutgoingMessage = zod.infer<typeof outgoingMessageSchema>;
