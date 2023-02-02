import React from "react";
import DiffViewer from "react-diff-viewer-continued";

// @ts-expect-error Somehow the component can only be accessed from .default
const ReactDiffViewer = DiffViewer.default;

interface DiffViewProps {
  oldCode: string;
  newCode: string;
}

export const DiffView: React.FC<DiffViewProps> = ({ oldCode, newCode }) => {
  return (
    <ReactDiffViewer oldValue={oldCode} newValue={newCode} splitView={true} />
  );
};
