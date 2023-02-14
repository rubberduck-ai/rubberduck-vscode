import zod from "zod";

export const errorSchema = zod.object({
  title: zod.string(),
  message: zod.string(),
  retry: zod
    .function()
    .returns(zod.union([zod.void(), zod.promise(zod.void())]))
    .optional(),
  dismiss: zod
    .function()
    .returns(zod.union([zod.void(), zod.promise(zod.void())]))
    .optional(),
});

/**
 * Say what happened.
 * Provide re-assurance and explain why it happened. Suggest actions
 * to help them fix it and/or give them a way out.
 *
 * You can use Markdown syntax.
 *
 * @example
 * {
 *   title: "Unable to connect to OpenAI",
 *   message: "Your changes were saved, but we could not connect your account due to a technical issue on our end. Please try connecting again. If the issue keeps happening, [contact Support](#link-to-contact-support)."
 * }
 */
export type Error = zod.infer<typeof errorSchema>;
