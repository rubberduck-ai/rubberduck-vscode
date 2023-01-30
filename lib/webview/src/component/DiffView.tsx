import React from "react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Diff, Hunk, parseDiff } from "react-diff-view";

interface DiffViewProps {
  diff: string;
}

// specific to the diff view
export const SquigglySeparator: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "10px",
        overflow: "hidden",
        position: "relative",
        marginTop: "10px",
        marginBottom: "10px",
        display: "table-row",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(45deg, transparent, transparent 49%, var(--vscode-foreground) 49%, transparent 51%)",
          position: "absolute",
          height: "10px",
          width: "200%",
          transform: "translate(-25%) scale(0.5)",
          backgroundSize: "20px 20px",
        }}
      />
      <div
        style={{
          background:
            "linear-gradient(-45deg, transparent, transparent 49%, var(--vscode-foreground) 49%, transparent 51%)",
          position: "absolute",
          height: "10px",
          width: "200%",
          transform: "translate(-25%) scale(0.5)",
          backgroundSize: "20px 20px",
        }}
      />
    </div>
  );
};

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
