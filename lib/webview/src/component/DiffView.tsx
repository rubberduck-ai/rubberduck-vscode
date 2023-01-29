import React from "react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Diff, Hunk, parseDiff } from "react-diff-view";
import { SquigglySeparator } from "./SquigglySeparator";

interface DiffViewProps {
  diff: string;
}

export const DiffView: React.FC<DiffViewProps> = ({ diff }) => {
  return (
    <>
      {parseDiff(diff).map(
        ({
          oldRevision,
          newRevision,
          type,
          hunks,
        }: {
          oldRevision: unknown;
          newRevision: unknown;
          type: unknown;
          hunks: unknown;
        }) => (
          <Diff
            key={`${oldRevision}-${newRevision}-unified`}
            // viewType="unified"
            diffType={type}
            hunks={hunks}
          >
            {(hunks: Array<unknown>) =>
              hunks.map((hunk: unknown, index: number) => (
                <>
                  {index > 0 && <SquigglySeparator key={`sep-${index}`} />}
                  <Hunk key={`hunk-${index}`} hunk={hunk} />
                </>
              ))
            }
          </Diff>
        )
      )}
    </>
  );
};
