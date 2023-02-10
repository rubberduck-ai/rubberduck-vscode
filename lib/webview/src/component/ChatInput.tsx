import React, { useCallback, useRef } from "react";

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

  const textareaWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div className="chat-input" ref={textareaWrapperRef}>
      <textarea
        ref={callbackRef}
        placeholder={placeholder}
        rows={1}
        onInput={(event) => {
          if (!textareaWrapperRef.current) return;

          // `replicatedValue` is used in the CSS to expand the input
          textareaWrapperRef.current.dataset.replicatedValue =
            event.currentTarget.value;
        }}
        onKeyUp={(event) => {
          // ignore shift+enter to allow the user to enter multiple lines
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            event.target instanceof HTMLTextAreaElement
          ) {
            const value = event.target.value.trim();

            if (value !== "") {
              event.preventDefault();
              event.stopPropagation();
              onSend(value);
            }
          }
        }}
      />
    </div>
  );
};
