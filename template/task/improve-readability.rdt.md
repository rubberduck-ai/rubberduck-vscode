# Improve Readability

The improve readability analysis suggests ways to make the selected code easier to read.

## Conversation Template

### Configuration

```json conversation-template
{
  "id": "improve-readability",
  "engineVersion": 0,
  "type": "selected-code-analysis-chat",
  "label": "Improve Readability",
  "description": "Improve the readability of the selected code.",
  "header": {
    "title": "Improve readability ({{location}})",
    "icon": {
      "type": "codicon",
      "value": "symbol-color"
    }
  },
  "variables": [
    {
      "name": "selectedText",
      "time": "conversation-start",
      "type": "active-editor",
      "property": "selected-text",
      "constraints": [{ "type": "text-length", "min": 1 }]
    },
    {
      "name": "language",
      "time": "conversation-start",
      "type": "active-editor",
      "property": "language-id",
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
    "placeholder": "Looking for readability improvements",
    "prompt": {
      "template": "analysis",
      "maxTokens": 1024
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
How could the readability of the code below be improved?
The programming language is {{language}}.
Consider overall readability and idiomatic constructs.

## Selected Code
\`\`\`
{{selectedText}}
\`\`\`

## Task
How could the readability of the code be improved?
The programming language is {{language}}.
Consider overall readability and idiomatic constructs.
Provide potential improvements suggestions where possible.
Consider that the code might be perfect and no improvements are possible.
Include code snippets (using Markdown) and examples where appropriate.
The code snippets must contain valid {{language}} code.

## Readability Improvements

```

### Chat Prompt Template

```template-chat
## Instructions
Continue the conversation below.
Pay special attention to the current developer request.
The programming language is {{language}}.

## Current Request
Developer: {{lastMessage}}

{{#if selectedText}}
## Selected Code
\`\`\`
{{selectedText}}
\`\`\`
{{/if}}

## Conversation
{{#each messages}}
{{#if (eq author "bot")}}
Bot: {{content}}
{{else}}
Developer: {{content}}
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
The code snippets must contain valid {{language}} code.

## Response
Bot:
```
