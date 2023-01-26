import { Explanation } from "@rubberduck/common";
import React from "react";

export const ExpandedExplanationView: React.FC<{
  explanation: Explanation;
}> = ({ explanation }) => (
  <div className={`explanation expanded`}>
    <div className="header">
      Code explanation ({explanation.filename} {explanation.selectionStartLine}:
      {explanation.selectionEndLine})
    </div>
    <div className="detail">{explanation.content}</div>
  </div>
);
