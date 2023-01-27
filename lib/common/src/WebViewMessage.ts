import zod from "zod";

export const WebViewMessageSchema = zod.discriminatedUnion("type", [
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

export type WebViewMessage = zod.infer<typeof WebViewMessageSchema>;
