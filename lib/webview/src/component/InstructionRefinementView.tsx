import { webviewApi } from "@rubberduck/common";
import React, { useState } from "react";
import { ChatInput } from "./ChatInput";

export function InstructionRefinementView({
  content,
  onSendMessage,
}: {
  content: webviewApi.InstructionRefinementContent;
  onSendMessage: (message: string) => void;
}) {
  const [inputText, setInputText] = useState(content.instruction);
  return (
    <div className="instruction-refinement">
      <ChatInput
        text={inputText}
        onChange={setInputText}
        onEnter={() => onSendMessage(inputText)}
      />
      <button onClick={() => onSendMessage(inputText)}>Generate</button>
    </div>
  );
}
