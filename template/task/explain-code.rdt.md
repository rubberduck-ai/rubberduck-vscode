# Explain Code

Explain the selected code.

## Conversation Template

### Configuration

```json conversation-template
{
  "id": "explain-code",
  "engineVersion": 0,
  "type": "selected-code-analysis-chat",
  "label": "Explain Code",
  "description": "Explain the selected code.",
  "icon": {
    "type": "codicon",
    "value": "book"
  },
  "chatTitle": "Explain Code",
  "initVariableRequirements": [
    {
      "type": "non-empty-text",
      "variable": "selectedText"
    }
  ],
  "analysis": {
    "placeholder": "Generating explanation",
    "prompt": {
      "template": "analysis",
      "maxTokens": 512
    }
  },
  "chat": {
    "prompt": {
      "template": "chat",
      "maxTokens": 1024,
      "stop": ["Bot:", "Developer:"]
    }
  }
}
```

### Analysis Prompt Template

```template-analysis
## Instructions
Summarize the code below (emphasizing its key functionality).

## Selected Code
\`\`\`
{{selectedText}}
\`\`\`

## Task
Summarize the code at a high level (including goal and purpose) with an emphasis on its key functionality.

## Response

```

### Chat Prompt Template

```template-chat
## Instructions
Continue the conversation below.
Pay special attention to the current developer request.

## Current Request
Developer: {{lastMessage}}

{{#if selectedText}}
## Selected Code
\`\`\`
{{selectedText}}
\`\`\`
{{/if}}

## Code Summary
{{firstMessage}}

## Conversation
{{#each messages}}
{{#if (neq @index 0)}}
{{#if (eq author "bot")}}
Bot: {{content}}
{{else}}
Developer: {{content}}
{{/if}}
{{/if}}
{{/each}}

## Task
Write a response that continues the conversation.
Stay focused on current developer request.
Consider the possibility that there might not be a solution.
Ask for clarification if the message does not make sense or more input is needed.
Use the style of a documentation article.
Omit any links.
Include code snippets (using Markdown) and examples where appropriate.

## Response
Bot:
```
