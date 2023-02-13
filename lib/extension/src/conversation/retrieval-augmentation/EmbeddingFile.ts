import zod from "zod";

export const embeddingFileSchema = zod.object({
  version: zod.literal(0),
  embedding: zod.object({
    source: zod.literal("openai"),
    model: zod.literal("text-embedding-ada-002"),
  }),
  chunks: zod.array(
    zod.object({
      start_position: zod.number(),
      end_position: zod.number(),
      content: zod.string(),
      file: zod.string(),
      embedding: zod.array(zod.number()),
    })
  ),
});

export type EmbeddingFile = zod.infer<typeof embeddingFileSchema>;
