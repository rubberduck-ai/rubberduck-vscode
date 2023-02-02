import { ConversationTemplate } from "./ConversationTemplate";

export const basicChatTemplate: ConversationTemplate = {
  id: "chat",
  engineVersion: 0,
  type: "basic-chat",
  label: "Start Chat",
  description: "Start a basic chat.",
  codicon: "comment-discussion",
  prompt: {
    sections: [
      {
        type: "lines",
        title: "Instructions",
        lines: [
          "Continue the conversation below.",
          "Pay special attention to the current developer request.",
        ],
      },
      {
        type: "lines",
        title: "Current Request",
        lines: ["Developer: ${lastMessage}"],
      },
      {
        type: "optional-selected-code",
        title: "Selected Code",
      },
      {
        type: "conversation",
        roles: {
          bot: "Bot",
          user: "Developer",
        },
      },
      {
        type: "lines",
        title: "Task",
        lines: [
          "Write a response that continues the conversation.",
          "Stay focused on current developer request.",
          "Consider the possibility that there might not be a solution.",
          "Ask for clarification if the message does not make sense or more input is needed.",
          "Use the style of a documentation article.",
          "Omit any links.",
          "Include code snippets (using Markdown) and examples where appropriate.",
        ],
      },
      {
        type: "lines",
        title: "Response",
        lines: ["Bot:"],
      },
    ],
    maxTokens: 1024,
    stop: ["Bot:", "Developer:"],
  },
};

export const explainCodeTemplate: ConversationTemplate = {
  id: "explain-code",
  engineVersion: 0,
  type: "selected-code-analysis-chat",
  label: "Explain Code",
  description: "Explain the selected code.",
  codicon: "book",
  initVariableConstraints: [
    {
      type: "required",
      variable: "selectedText",
    },
  ],
  analysisPlaceholder: "Generating explanation",
  analysisPrompt: {
    sections: [
      {
        type: "lines",
        title: "Instructions",
        lines: [
          "Summarize the code below (emphasizing its key functionality).",
        ],
      },
      {
        type: "optional-selected-code",
        title: "Selected Code",
      },
      {
        type: "lines",
        title: "Task",
        lines: [
          "Summarize the code at a high level (including goal and purpose) with an emphasis on its key functionality.",
        ],
      },
      {
        type: "lines",
        title: "Response",
        lines: [],
      },
    ],
    maxTokens: 512,
  },
  chatTitle: "Explain Code",
  chatPrompt: {
    sections: [
      {
        type: "lines",
        title: "Instructions",
        lines: [
          "Continue the conversation below.",
          "Pay special attention to the current developer request.",
        ],
      },
      {
        type: "lines",
        title: "Current Request",
        lines: ["Developer: ${lastMessage}"],
      },
      {
        type: "optional-selected-code",
        title: "Selected Code",
      },
      {
        type: "lines",
        title: "Code Summary",
        lines: ["${firstMessage}"],
      },
      {
        type: "conversation",
        excludeFirstMessage: true,
        roles: {
          bot: "Bot",
          user: "Developer",
        },
      },
      {
        type: "lines",
        title: "Task",
        lines: [
          "Write a response that continues the conversation.",
          "Stay focused on current developer request.",
          "Consider the possibility that there might not be a solution.",
          "Ask for clarification if the message does not make sense or more input is needed.",
          "Use the style of a documentation article.",
          "Omit any links.",
          "Include code snippets (using Markdown) and examples where appropriate.",
        ],
      },
      {
        type: "lines",
        title: "Response",
        lines: ["Bot:"],
      },
    ],
    maxTokens: 1024,
    stop: ["Bot:", "Developer:"],
  },
};
