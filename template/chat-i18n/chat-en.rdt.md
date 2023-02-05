# AI Chat in English

This templates lets you chat with Rubberduck in English.

## Conversation Template

### Configuration

```json conversation-template
{
  "id": "chat-en",
  "engineVersion": 0,
  "type": "basic-chat",
  "label": "Start chat",
  "description": "Start a basic chat with Rubberduck.",
  "icon": {
    "type": "codicon",
    "value": "comment-discussion"
  },
  "prompt": {
    "template": "chat",
    "maxTokens": 1024,
    "stop": ["Bot:", "Developer:"]
  }
}
```

### Chat Prompt Template

```template-chat
## Instructions
Continue the conversation below."
Pay special attention to the current developer request.

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

## Response
Bot:
```
