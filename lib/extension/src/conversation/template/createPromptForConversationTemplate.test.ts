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
      firstMessage: undefined,
      lastMessage: undefined,
      language: undefined,
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
      firstMessage: "Hello",
      lastMessage: "Hi",
      language: undefined,
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

  it("should exclude first message in a conversation section if configured", () => {
    const sections = [
      {
        type: "conversation" as const,
        excludeFirstMessage: true,
        roles: {
          bot: "Expert",
          user: "Developer",
        },
      },
    ];
    const variables = {
      selectedText: undefined,
      firstMessage: "Hello",
      lastMessage: "Hi",
      language: undefined,
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
      firstMessage: undefined,
      lastMessage: undefined,
      language: undefined,
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
      firstMessage: undefined,
      lastMessage: undefined,
      language: undefined,
      messages: [],
    };

    const result = createPromptForConversationTemplate({ sections, variables });

    expect(result).toBe("");
  });

  it("should return an empty result if selected text is only whitespace", () => {
    const sections = [
      {
        type: "optional-selected-code" as const,
        title: "Some title",
      },
    ];
    const variables = {
      selectedText: "    \n\r",
      firstMessage: undefined,
      lastMessage: undefined,
      language: undefined,
      messages: [],
    };

    const result = createPromptForConversationTemplate({ sections, variables });

    expect(result).toBe("");
  });

  it("should return an empty string if no sections are provided", () => {
    const variables = {
      selectedText: undefined,
      firstMessage: undefined,
      lastMessage: undefined,
      language: undefined,
      messages: [],
    };

    const result = createPromptForConversationTemplate({
      sections: [],
      variables,
    });

    expect(result).toBe("");
  });
});
