import zod from "zod";

export const outgoingMessageSchema = zod.discriminatedUnion("type", [
  zod.object({
    type: zod.literal("startChat"),
  }),
  zod.object({
    type: zod.literal("clickCollapsedExplanation"),
    data: zod.object({
      index: zod.number(),
    }),
  }),
  zod.object({
    type: zod.literal("sendChatMessage"),
    data: zod.object({
      index: zod.number(),
      message: zod.string(),
    }),
  }),
]);

/**
 * A message sent from the webview to the extension.
 */
export type OutgoingMessage = zod.infer<typeof outgoingMessageSchema>;
