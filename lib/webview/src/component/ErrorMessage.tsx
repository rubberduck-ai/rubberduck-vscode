import { webviewApi } from "@rubberduck/common";
import React from "react";

export function ErrorMessage({
  error,
  onClickRetry,
}: {
  error: webviewApi.Error;
  onClickRetry: () => void;
}) {
  return (
    <div key={"error"} className={"message bot error"}>
      <span className={"error-message"}>
        Error: {typeof error === "string" ? error : error.title}
      </span>
      <span className={"error-retry"} onClick={onClickRetry}>
        <i className="codicon codicon-debug-restart inline" />
        <span style={{ marginLeft: "5px" }}>Retry</span>
      </span>
    </div>
  );
}
