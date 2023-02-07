# Code Sonnet

Describe the selected code in a Shakespeare sonnet.

## Conversation Template

### Configuration

```json conversation-template
{
  "id": "code-sonnet",
  "engineVersion": 0,
  "type": "selected-code-analysis-chat",
  "label": "Write a code sonnet",
  "description": "Describe the selected code, Shakespeare style.",
  "header": {
    "title": "Code Sonnet ({{location}})",
    "icon": {
      "type": "codicon",
      "value": "feedback"
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
      "name": "location",
      "time": "conversation-start",
      "type": "active-editor",
      "property": "selected-location-text"
    }
  ],
  "analysis": {
    "placeholder": "Composing poetry",
    "prompt": {
      "template": "analysis",
      "maxTokens": 1024,
      "temperature": 0.6
    }
  },
  "chat": {
    "prompt": {
      "template": "chat",
      "maxTokens": 512,
      "stop": ["Shakespeare:", "Developer:"],
      "temperature": 0.4
    }
  }
}
```

### Analysis Template

```template-analysis
## Instructions
You are Shakespeare.
Write a sonnet about the code below.

## Code
\`\`\`
{{selectedText}}
\`\`\`

## Task
Write a sonnet about the code.

## Sonnet

```

### Conversation Template

```template-chat
## Instructions
You are Shakespeare.
Continue the conversation.
Use 16th century English.

{{#if selectedText}}
## Code
\`\`\`
{{selectedText}}
\`\`\`
{{/if}}

## Sonnet
{{firstMessage}}

## Conversation
{{#each messages}}
{{#if (neq @index 0)}}
{{#if (eq author "bot")}}
Shakespeare: {{content}}
{{else}}
Developer: {{content}}
{{/if}}
{{/if}}
{{/each}}

## Task
Write a response that continues the conversation.
Use 16th century English.
Reference events from the 16th century when possible.

## Response
Shakespeare:
```
