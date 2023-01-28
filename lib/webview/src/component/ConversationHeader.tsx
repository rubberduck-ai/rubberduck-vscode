import { webviewApi } from "@rubberduck/common";
import React from "react";

export const SelectionView: React.FC<{
  selection: webviewApi.Selection;
}> = ({ selection }) => (
  <>
    ({selection.filename} {selection.startLine}:{selection.endLine})
  </>
);

export const ConversationHeader: React.FC<{
  conversation: webviewApi.Conversation;
}> = ({ conversation }) => (
  <div className="header">
    {(() => {
      const type = conversation.trigger.type;
      switch (type) {
        case "startChat": {
          return (
            <>
              <i className="codicon codicon-comment-discussion inline" />
              {conversation.messages.length === 0 ? (
                "New Chat"
              ) : (
                <span className="message user">
                  {conversation.messages[0].content}
                </span>
              )}
            </>
          );
        }
        case "explainCode": {
          return (
            <>
              <i className="codicon codicon-book inline" />
              Explain Code{" "}
              <SelectionView selection={conversation.trigger.selection} />
            </>
          );
        }
        case "generateTest": {
          return (
            <>
              <i className="codicon codicon-beaker inline" />
              Generate Test{" "}
              <SelectionView selection={conversation.trigger.selection} />
            </>
          );
        }
        default: {
          const exhaustiveCheck: never = type;
          throw new Error(`unsupported type: ${exhaustiveCheck}`);
        }
      }
    })()}
  </div>
);
