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
    <ChatInput
      text={inputText}
      onChange={setInputText}
      onEnter={onSendMessage}
    />
  );
}
