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
  "icon": {
    "type": "codicon",
    "value": "feedback"
  },
  "initVariableRequirements": [
    {
      "type": "non-empty-text",
      "variable": "selectedText"
    }
  ],
  "analysisPlaceholder": "Composing poetry",
  "analysisPrompt": {
    "template": {
      "type": "handlebars",
      "promptTemplate": "analysis"
    },
    "maxTokens": 1024,
    "temperature": 0.5
  },
  "chatTitle": "Code Sonnet",
  "chatPrompt": {
    "template": {
      "type": "handlebars",
      "promptTemplate": "chat"
    },
    "maxTokens": 1024,
    "stop": ["Shakespeare:", "Developer:"],
    "temperature": 0.5
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

## Conversation
{{#each messages}}
{{#if (eq author "bot")}}
Shakespeare: {{content}}
{{else}}
Developer: {{content}}
{{/if}}
{{/each}}

## Task
Write a response that continues the conversation.
Use 16th century English.
Reference events from the 16th century when possible.
Try making it a sonnet when possible.

## Response
Shakespeare:
```
