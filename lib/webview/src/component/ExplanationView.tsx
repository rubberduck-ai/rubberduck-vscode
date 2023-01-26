import { Explanation } from "@rubberduck/common";
import React from "react";

export const ExplanationView: React.FC<{
  explanation: Explanation;
}> = ({ explanation }) => (
  <div className="explanation">
    <div className="head">
      Code explanation ({explanation.filename} {explanation.selectionStartLine}:
      {explanation.selectionEndLine})
    </div>
    <div className="detail">{explanation.content}</div>
  </div>
);
