import zod from "zod";

export const ConversationTemplateSchema = zod.object({
  id: zod.string(),
  engineVersion: zod.literal(0),
  type: zod.literal("basic-chat"),
  codicon: zod.string(),
  prompt: zod.object({
    sections: zod.array(
      zod.discriminatedUnion("type", [
        zod.object({
          type: zod.literal("lines"),
          title: zod.string(),
          lines: zod.array(zod.string()),
        }),
        zod.object({
          type: zod.literal("optional-selected-code"),
          title: zod.string(),
        }),
        zod.object({
          type: zod.literal("conversation"),
          roles: zod.object({
            bot: zod.string(),
            user: zod.string(),
          }),
        }),
      ])
    ),
    maxTokens: zod.number(),
    stop: zod.array(zod.string()),
  }),
});

export type ConversationTemplate = zod.infer<typeof ConversationTemplateSchema>;
