import React, { useCallback, useRef } from "react";

export const ChatInput: React.FC<{
  placeholder?: string;
  text: string;
  onChange: (text: string) => void;
  onEnter: (text: string) => void;
}> = ({ placeholder, text, onChange, onEnter }) => {
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
        value={text}
        rows={1}
        onInput={(event) => {
          if (!textareaWrapperRef.current) return;

          // `replicatedValue` is used in the CSS to expand the input
          textareaWrapperRef.current.dataset.replicatedValue =
            event.currentTarget.value;
          onChange(event.currentTarget.value);
        }}
        // capture onKeyDown to prevent the user from adding enter to the input
        onKeyDown={(event) => {
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
              onEnter(value);
            }
          }
        }}
      />
    </div>
  );
};
