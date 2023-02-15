import fs from "node:fs/promises";
import { simpleGit } from "simple-git";
import * as vscode from "vscode";
import { Chunk } from "./chunk/Chunk";
import { createSplitLinearLines } from "./chunk/splitLinearLines";

export async function indexRepository() {
  const repositoryPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (repositoryPath == undefined) {
    vscode.window.showErrorMessage("Rubberduck: No workspace folder is open.");
    return;
  }

  console.log("index repository", {
    workspaceRootPath: repositoryPath,
  });

  const git = simpleGit({
    baseDir: repositoryPath,
    binary: "git",
    maxConcurrentProcesses: 6,
    trimmed: false,
  });

  const files = (await git.raw(["ls-files"])).split("\n");
  const chunksWithEmbedding: Array<
    Chunk & {
      file: string;
      embedding: Array<number>;
    }
  > = [];

  let tokenCount = 0;

  for (const file of files) {
    if (!isSupportedFile(file)) {
      continue;
    }

    const content = await fs.readFile(`${repositoryPath}/${file}`, "utf8");

    const chunks = createSplitLinearLines({
      maxChunkCharacters: 150,
    })(content);

    for (const chunk of chunks) {
      console.log(
        `Generating embedding for chunk '${file}' ${chunk.startPosition}:${chunk.endPosition}`
      );

      try {
        const embeddingResult = {
          embedding: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          usage: { totalTokens: 0 },
        };
        // await openAiClient.generateEmbedding({
        //   input: chunk.content,
        // });

        chunksWithEmbedding.push({
          file,
          ...chunk,
          embedding: embeddingResult.embedding,
        });

        tokenCount += embeddingResult.usage.totalTokens;
      } catch (error) {
        console.error(error);

        console.log(
          `Failed to generate embedding for chunk '${file}' ${chunk.startPosition}:${chunk.endPosition}`
        );
      }
    }
  }

  //   await fs.writeFile(outputFile, JSON.stringify(chunksWithEmbedding));

  console.log();
  console.log(`Tokens used: ${tokenCount}`);
  console.log(`Cost: ${(tokenCount / 1000) * 0.0004} USD`);
}

function isSupportedFile(file: string) {
  return (
    (file.endsWith(".js") ||
      file.endsWith(".ts") ||
      file.endsWith(".tsx") ||
      file.endsWith(".sh") ||
      file.endsWith(".yaml") ||
      file.endsWith(".yml") ||
      file.endsWith(".md") ||
      file.endsWith(".css") ||
      file.endsWith(".json") ||
      file.endsWith(".toml") ||
      file.endsWith(".config")) &&
    !(
      file.endsWith(".min.js") ||
      file.endsWith(".min.css") ||
      file.endsWith("pnpm-lock.yaml")
    )
  );
}
