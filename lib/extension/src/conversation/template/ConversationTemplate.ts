import zod from "zod";

const promptSchema = zod.object({
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
        excludeFirstMessage: zod.boolean().optional(),
        roles: zod.object({
          bot: zod.string(),
          user: zod.string(),
        }),
      }),
    ])
  ),
  maxTokens: zod.number(),
  stop: zod.array(zod.string()).optional(),
});

export type Prompt = zod.infer<typeof promptSchema>;

const baseTemplateSchema = zod.object({
  id: zod.string(),
  engineVersion: zod.literal(0),
  label: zod.string(),
  description: zod.string(),
  codicon: zod.string(),
});

export const conversationTemplateSchema = zod.discriminatedUnion("type", [
  baseTemplateSchema.extend({
    type: zod.literal("basic-chat"),
    prompt: promptSchema,
  }),
  baseTemplateSchema.extend({
    type: zod.literal("selected-code-analysis-chat"),
    analysisPlaceholder: zod.string().optional(),
    analysisPrompt: promptSchema,
    chatPrompt: promptSchema,
  }),
]);

export type ConversationTemplate = zod.infer<typeof conversationTemplateSchema>;
