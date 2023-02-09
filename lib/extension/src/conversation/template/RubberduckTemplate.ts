import zod from "zod";

const promptSchema = zod.object({
  template: zod.string(),
  maxTokens: zod.number(),
  stop: zod.array(zod.string()).optional(),
  temperature: zod.number().optional(),
});

export type Prompt = zod.infer<typeof promptSchema>;

const completionHandlerSchema = zod.discriminatedUnion("type", [
  zod.object({
    type: zod.literal("message"),
  }),
  zod.object({
    type: zod.literal("update-temporary-editor"),
    botMessage: zod.string(),
    language: zod.string().optional(),
  }),
  zod.object({
    type: zod.literal("active-editor-diff"),
  }),
]);

const messageProcessorSchema = zod.object({
  placeholder: zod.string().optional(),
  completionHandler: completionHandlerSchema.optional(), // default: message
  prompt: promptSchema,
});

export type MessageProcessor = zod.infer<typeof messageProcessorSchema>;

const variableBaseSchema = zod.object({
  name: zod.string(),
  constraints: zod
    .array(
      zod.discriminatedUnion("type", [
        zod.object({
          type: zod.literal("text-length"),
          min: zod.number(),
        }),
      ])
    )
    .optional(),
});

const variableSchema = zod.discriminatedUnion("type", [
  variableBaseSchema.extend({
    type: zod.literal("constant"),
    time: zod.literal("conversation-start"),
    value: zod.string(),
  }),
  variableBaseSchema.extend({
    type: zod.literal("message"),
    time: zod.literal("message"),
    index: zod.number(),
    property: zod.enum(["content"]),
  }),
  variableBaseSchema.extend({
    type: zod.literal("active-editor"),
    time: zod.enum(["conversation-start", "message"]),
    property: zod.enum([
      "language-id",
      "selected-text",
      "selected-location-text",
      "filename",
    ]),
  }),
  variableBaseSchema.extend({
    type: zod.literal("selected-text-with-diagnostics"),
    time: zod.literal("conversation-start"),
    severities: zod.array(
      zod.enum(["error", "warning", "information", "hint"])
    ),
  }),
]);

export type Variable = zod.infer<typeof variableSchema>;

const baseTemplateSchema = zod.object({
  id: zod.string(),
  engineVersion: zod.literal(0),
  label: zod.string(),
  description: zod.string(),
  header: zod.object({
    title: zod.string(),
    useFirstMessageAsTitle: zod.boolean().optional(), // default: false
    icon: zod.object({
      type: zod.literal("codicon"),
      value: zod.string(),
    }),
  }),
  isEnabled: zod.boolean().optional(), // default: true
  variables: zod.array(variableSchema).optional(),
});

export const rubberduckTemplateSchema = zod.discriminatedUnion("type", [
  baseTemplateSchema.extend({
    type: zod.literal("basic-chat"),
    chat: messageProcessorSchema,
  }),
  baseTemplateSchema.extend({
    type: zod.literal("selected-code-analysis-chat"),
    analysis: messageProcessorSchema,
    chat: messageProcessorSchema,
  }),
]);

export type RubberduckTemplate = zod.infer<typeof rubberduckTemplateSchema>;
