import { Explanation } from "@rubberduck/common";
import React from "react";
import { ExplanationHeader } from "./ExplanationHeader";

export const ExpandedExplanationView: React.FC<{
  explanation: Explanation;
}> = ({ explanation }) => (
  <div className={`explanation expanded`}>
    <ExplanationHeader explanation={explanation} />
    <div className="detail">{explanation.content}</div>
  </div>
);
