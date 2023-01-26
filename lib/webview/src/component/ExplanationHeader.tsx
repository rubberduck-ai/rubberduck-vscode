import { Explanation } from "@rubberduck/common";
import React from "react";

export const ExplanationHeader: React.FC<{
  explanation: Explanation;
}> = ({ explanation }) => (
  <div className="header">
    Code explanation ({explanation.filename} {explanation.selectionStartLine}:
    {explanation.selectionEndLine})
  </div>
);
