import { webviewApi } from "@rubberduck/common";
import React from "react";
import { ChatInput } from "./ChatInput";

export function InstructionRefinementView({
  content,
  onSendMessage,
}: {
  content: webviewApi.InstructionRefinementContent;
  onSendMessage: (message: string) => void;
}) {
  return <ChatInput content={content.instruction} onSend={onSendMessage} />;
}
