import React, { useCallback } from "react";

export const ChatInput: React.FC<{
  placeholder?: string;
  onSend: (message: string) => void;
}> = ({ placeholder, onSend }) => {
  // callback to automatically focus the input box
  const callbackRef = useCallback((inputElement: HTMLTextAreaElement) => {
    if (inputElement) {
      // delay focus (auto-focussing the input box did not work otherwise)
      setTimeout(() => {
        inputElement.focus();
      }, 50);
    }
  }, []);

  return (
    <div className="chat-input">
      <textarea
        ref={callbackRef}
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
