import { Explanation } from "@rubberduck/common";
import React from "react";

export const CollapsedExplanationView: React.FC<{
  explanation: Explanation;
  onClick: () => void;
}> = ({ explanation, onClick }) => (
  <div className={`explanation collapsed`} onClick={onClick}>
    <div className="header">
      Code explanation ({explanation.filename} {explanation.selectionStartLine}:
      {explanation.selectionEndLine})
    </div>
  </div>
);
