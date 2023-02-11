import { webviewApi } from "@rubberduck/common";
import React, { useState } from "react";
import { ChatInput } from "./ChatInput";

export function InstructionRefinementView({
  content,
  onSendMessage,
  onClickRetry,
}: {
  content: webviewApi.InstructionRefinementContent;
  onSendMessage: (message: string) => void;
  onClickRetry: () => void;
}) {
  const [inputText, setInputText] = useState(content.instruction);
  return (
    <div className="instruction-refinement">
      {(() => {
        const type = content.state.type;
        switch (type) {
          case "waitingForBotAnswer":
            return (
              <>
                <ChatInput text={inputText} disabled />
                <button disabled>
                  {content.state.botAction ?? "Generating"}
                </button>
              </>
            );
          case "userCanRefineInstruction":
            return (
              <>
                <ChatInput
                  text={inputText}
                  placeholder={"Enter instructions…"}
                  onChange={setInputText}
                  onShiftEnter={() => onSendMessage(inputText)}
                />
                <button onClick={() => onSendMessage(inputText)}>
                  Generate
                </button>
              </>
            );
          case "error":
            return (
              <div key={"error"} className={"message bot error"}>
                <span className={"error-message"}>
                  Error: {content.state.errorMessage}
                </span>
                <span className={"error-retry"} onClick={onClickRetry}>
                  <i className="codicon codicon-debug-restart inline" />
                  <span style={{ marginLeft: "5px" }}>Retry</span>
                </span>
              </div>
            );
          default: {
            const exhaustiveCheck: never = type;
            throw new Error(`unsupported type: ${exhaustiveCheck}`);
          }
        }
      })()}
    </div>
  );
}
