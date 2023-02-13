import * as vscode from "vscode";
import { readFileContent } from "../../vscode/readFileContent";
import { RetrievalAugmentation } from "../template/RubberduckTemplate";
import secureJSON from "secure-json-parse";
import { embeddingFileSchema } from "./EmbeddingFile";
import { cosineSimilarity } from "./cosineSimilarity";
import { OpenAIClient } from "../../openai/OpenAIClient";

export async function executeRetrievalAugmentation({
  retrievalAugmentation,
  variables,
  openAIClient,
}: {
  retrievalAugmentation: RetrievalAugmentation;
  variables: Record<string, unknown>;
  openAIClient: OpenAIClient;
}): Promise<string | undefined> {
  const startTime = Date.now();

  const file = retrievalAugmentation.file;

  const fileUri = vscode.Uri.joinPath(
    vscode.workspace.workspaceFolders?.[0]?.uri ?? vscode.Uri.file(""),
    ".rubberduck/embedding",
    file
  );

  const fileContent = await readFileContent(fileUri);
  const parsedContent = secureJSON.parse(fileContent);
  const { chunks } = embeddingFileSchema.parse(parsedContent);

  // TODO call to get query similarity

  const result = await openAIClient.generateEmbedding({
    input: retrievalAugmentation.query,
  });

  if (result.type === "error") {
    console.log(result.errorMessage);
    return undefined;
  }

  const queryEmbedding = result.embedding!;

  const similarityChunks = chunks
    .map(({ start_position, end_position, content, file, embedding }) => ({
      file,
      startPosition: start_position,
      endPosition: end_position,
      content,
      similarity: cosineSimilarity(embedding, queryEmbedding),
    }))
    .filter(({ similarity }) => similarity >= retrievalAugmentation.threshold);

  similarityChunks.sort((a, b) => b.similarity - a.similarity);

  const topN = similarityChunks.slice(0, retrievalAugmentation.maxResults);

  console.log(topN);

  console.log(`Time taken: ${Date.now() - startTime}ms`);

  return undefined;
}
