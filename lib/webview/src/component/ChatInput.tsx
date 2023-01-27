import React from "react";

export const ChatInput: React.FC<{
  placeholder?: string;
  onSend: (message: string) => void;
}> = ({ placeholder, onSend }) => {
  return (
    <div className="chat-input">
      <textarea
        placeholder={placeholder}
        rows={1 /* TODO auto-expand */}
        onKeyUp={(e) => {
          // ignore shift+enter to allow the user to enter multiple lines
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();

            onSend((e.target as any).value);
          }
        }}
      />
    </div>
  );
};
