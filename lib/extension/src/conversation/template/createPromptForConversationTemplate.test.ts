import { describe, expect, it } from "vitest";
import { createPromptForConversationTemplate } from "./createPromptForConversationTemplate";

describe("createPromptForConversationTemplate", () => {
  it("should return a prompt with lines section", () => {
    const sections = [
      {
        type: "lines" as const,
        title: "Lines",
        lines: ["This is a ${variable}"],
      },
    ];
    const variables = {
      selectedText: undefined,
      lastMessage: undefined,
      messages: [],
      variable: "test",
    };

    const result = createPromptForConversationTemplate({ sections, variables });

    expect(result).toBe(`## Lines
This is a test`);
  });

  it("should return a prompt with conversation section", () => {
    const sections = [
      {
        type: "conversation" as const,
        roles: {
          bot: "Expert",
          user: "Developer",
        },
      },
    ];
    const variables = {
      selectedText: undefined,
      lastMessage: "Hi",
      messages: [
        {
          author: "bot" as const,
          content: "Hello",
        },
        {
          author: "user" as const,
          content: "Hi",
        },
      ],
    };

    const result = createPromptForConversationTemplate({ sections, variables });

    expect(result).toBe(`## Conversation
Expert: Hello
Developer: Hi`);
  });

  it("should return a prompt with optional selected code section", () => {
    const sections = [
      {
        type: "optional-selected-code" as const,
        title: "Some title",
      },
    ];
    const variables = {
      selectedText: 'const test = "test";',
      lastMessage: undefined,
      messages: [],
    };

    const result = createPromptForConversationTemplate({ sections, variables });

    expect(result).toBe(`## Selected Code
\`\`\`
const test = "test";
\`\`\``);
  });

  it("should return an empty result if selected text is empty", () => {
    const sections = [
      {
        type: "optional-selected-code" as const,
        title: "Some title",
      },
    ];
    const variables = {
      selectedText: "",
      lastMessage: undefined,
      messages: [],
    };

    const result = createPromptForConversationTemplate({ sections, variables });

    expect(result).toBe("");
  });

  it("should return an empty result if selected text is only whitespaces", () => {
    const sections = [
      {
        type: "optional-selected-code" as const,
        title: "Some title",
      },
    ];
    const variables = {
      selectedText: "    \n\r",
      lastMessage: undefined,
      messages: [],
    };

    const result = createPromptForConversationTemplate({ sections, variables });

    expect(result).toBe("");
  });

  it("should return an empty string if no sections are provided", () => {
    const variables = {
      selectedText: undefined,
      lastMessage: undefined,
      messages: [],
    };

    const result = createPromptForConversationTemplate({
      sections: [],
      variables,
    });

    expect(result).toBe("");
  });
});
