import DiffMatchPatch, { patch_obj } from "diff-match-patch";

function getCoords(start: number, length: number) {
  return length === 0
    ? `${start},0`
    : length === 1
    ? start + 1
    : `${start + 1},${length}`;
}

const operators = ["-", " ", "+"];

function getOperator(diffType: number) {
  return operators[diffType + 1];
}

function patchToString(patch: any, lineArray: any) {
  const coords1 = getCoords(patch.start1, patch.length1);
  const coords2 = getCoords(patch.start2, patch.length2);

  const text = [`@@ -${coords1} +${coords2} @@\n`];

  for (const [type, chars] of patch.diffs) {
    for (let i = 0; i < chars.length; i++) {
      let line = lineArray[chars.charCodeAt(i)];

      if (line.endsWith("\n")) {
        line = line.substring(0, line.length - 1);
      }

      // replace characters with lines, patch in special end of file warning
      line = line.replace(EOF, "\n\\ No newline at end of file");

      text.push(`${getOperator(type) + line}\n`);
    }
  }

  return text.join("");
}

const EOF = "\u0005";

/**
 * Sometimes the context around a patch can be too large (possibly a bug in diff-match-patch) and patches can overlap.
 * This causes the unidiff to be invalid (patch fails to apply, lines shown multiple times in the UI).
 * As a workaround, this code ensures that the context around diffs is at most 'context' lines long.
 */
function fixPatchContext(patch: patch_obj, context: number) {
  const firstDiff = patch.diffs[0];
  const startLength = firstDiff[1].length;
  const startNotAChange = firstDiff[0] === 0;
  if (startNotAChange && startLength > context) {
    const startDifference = startLength - context;
    patch.start1 = patch.start1! + startDifference;
    patch.start2 = patch.start2! + startDifference;
    patch.length1 = patch.length1 - startDifference;
    patch.length2 = patch.length2 - startDifference;
    firstDiff[1] = firstDiff[1].substring(startDifference);
  }

  const lastDiff = patch.diffs[patch.diffs.length - 1];
  const endLength = lastDiff[1].length;
  const endNotAChange = lastDiff[0] === 0;
  if (endNotAChange && endLength > context) {
    const endDifference = endLength - context;
    patch.length1 = patch.length1 - endDifference;
    patch.length2 = patch.length2 - endDifference;
    lastDiff[1] = lastDiff[1].substring(0, endLength - endDifference);
  }
}

function printPatchesAsUnidiff(
  patches: patch_obj[],
  lineArray: string[],
  file: string
) {
  const text = patches.map((patch) => patchToString(patch, lineArray)).join("");

  return `--- /${file}
+++ /${file}
${text}`;
}

export function createDiff({
  filename,
  originalContent,
  newContent,
  contextLines = 3,
}: {
  filename: string;
  originalContent: string;
  newContent: string;
  contextLines?: number | undefined;
}): string {
  /*
   * Implementation note: the first implementation of createDiff used JS Diff ( https://github.com/kpdecker/jsdiff ).
   * However, jsdiff had significant limitations with larger files
   * (see e.g. https://github.com/kpdecker/jsdiff/issues/239).
   *
   * Google diff-match-parse is a lot faster, but needed several workarounds to generate correct
   * line-based Unidiffs. These workarounds are implemented here.
   *
   * Limitation: Due to the max number of UTF character, only up to 65k lines per source file are supported.
   */

  const dmp = new DiffMatchPatch.diff_match_patch();
  dmp.Patch_Margin = contextLines;

  // mark end of file if there is no terminating newline
  if (!originalContent.endsWith("\n")) {
    originalContent += EOF;
  }
  if (!newContent.endsWith("\n")) {
    newContent += EOF;
  }

  const {
    chars1: lines1,
    chars2: lines2,
    lineArray,
  } = dmp.diff_linesToChars_(originalContent, newContent);

  const diffs = dmp.diff_main(lines1, lines2, false);
  const patches = dmp.patch_make(diffs);

  patches.forEach((patch) => fixPatchContext(patch, contextLines));

  return printPatchesAsUnidiff(patches, lineArray, filename);
}
