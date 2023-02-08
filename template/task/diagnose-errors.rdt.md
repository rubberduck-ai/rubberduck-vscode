# Explain Code

Diagnoses any errors or warnings the selected code.

## Conversation Template

### Configuration

```json conversation-template
{
  "id": "diagnose-errors",
  "engineVersion": 0,
  "type": "selected-code-analysis-chat",
  "label": "Diagnose Errors",
  "description": "Diagnose errors and warnings in the selected code.",
  "header": {
    "title": "Diagnose Errors ({{location}})",
    "icon": {
      "type": "codicon",
      "value": "search-fuzzy"
    }
  },
  "variables": [
    {
      "name": "selectedTextWithDiagnostics",
      "time": "conversation-start",
      "type": "selected-text-with-diagnostics",
      "diagnostics": ["error", "warning"],
      "constraints": [{ "type": "text-length", "min": 1 }]
    },
    {
      "name": "location",
      "time": "conversation-start",
      "type": "active-editor",
      "property": "selected-location-text"
    },
    {
      "name": "firstMessage",
      "time": "message",
      "type": "message",
      "property": "content",
      "index": 0
    },
    {
      "name": "lastMessage",
      "time": "message",
      "type": "message",
      "property": "content",
      "index": -1
    }
  ],
  "analysis": {
    "placeholder": "Diagnosing errors",
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
Read through the errors and warnings in the code below.

## Selected Code
\`\`\`
{{selectedTextWithDiagnostics}}
\`\`\`

## Task
For each error or warning, write a paragraph that describes the most likely cause and a potential fix.
Include code snippets where appropriate.

## Answer

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
{{selectedTextWithDiagnostics}}
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
