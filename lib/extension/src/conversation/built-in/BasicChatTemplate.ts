import { parseConversationTemplateOrThrow } from "../template/parseConversationTemplate";

export const basicChatTemplate = parseConversationTemplateOrThrow(`
\`\`\`json conversation-template
{
  "id": "chat",
  "engineVersion": 0,
  "type": "basic-chat",
  "label": "Start Chat",
  "description": "Start a basic chat.",
  "icon": {
    "type": "codicon",
    "value": "comment-discussion"
  },
  "prompt": {
    "sections": [
      {
        "type": "lines",
        "title": "Instructions",
        "lines": [
          "Continue the conversation below.",
          "Pay special attention to the current developer request."
        ]
      },
      {
        "type": "lines",
        "title": "Current Request",
        "lines": [
          "Developer: \${lastMessage}"
        ]
      },
      {
        "type": "optional-selected-code",
        "title": "Selected Code"
      },
      {
        "type": "conversation",
        "roles": {
          "bot": "Bot",
          "user": "Developer"
        }
      },
      {
        "type": "lines",
        "title": "Task",
        "lines": [
          "Write a response that continues the conversation.",
          "Stay focused on current developer request.",
          "Consider the possibility that there might not be a solution.",
          "Ask for clarification if the message does not make sense or more input is needed.",
          "Use the style of a documentation article.",
          "Omit any links.",
          "Include code snippets (using Markdown) and examples where appropriate."
        ]
      },
      {
        "type": "lines",
        "title": "Response",
        "lines": [
          "Bot:"
        ]
      }
    ],
    "maxTokens": 1024,
    "stop": [
      "Bot:",
      "Developer:"
    ]
  }
}
\`\`\`
`);
