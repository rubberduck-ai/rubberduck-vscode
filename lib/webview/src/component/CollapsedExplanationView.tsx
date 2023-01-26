import { Explanation } from "@rubberduck/common";
import React from "react";
import { ExplanationHeader } from "./ExplanationHeader";

export const CollapsedExplanationView: React.FC<{
  explanation: Explanation;
  onClick: () => void;
}> = ({ explanation, onClick }) => (
  <div className={`explanation collapsed`} onClick={onClick}>
    <ExplanationHeader explanation={explanation} />
  </div>
);
