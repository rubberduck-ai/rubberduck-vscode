# Find Bugs

## Conversation Template

### Configuration

```json conversation-template
{
  "id": "find-bugs",
  "engineVersion": 0,
  "type": "selected-code-analysis-chat",
  "label": "Find bugs",
  "description": "Find any potential bugs in the selected code.",
  "icon": {
    "type": "codicon",
    "value": "bug"
  },
  "initVariableRequirements": [
    {
      "type": "non-empty-text",
      "variable": "selectedText"
    },
    {
      "type": "non-empty-text",
      "variable": "language"
    }
  ],
  "analysisPlaceholder": "Searching for bugs",
  "analysisPrompt": {
    "template": {
      "type": "handlebars",
      "promptTemplate": "analysis"
    },
    "maxTokens": 1024
  },
  "chatTitle": "Find bugs",
  "chatPrompt": {
    "template": {
      "type": "handlebars",
      "promptTemplate": "chat"
    },
    "maxTokens": 1024,
    "stop": ["Bot:", "Developer:"]
  }
}
```

### Analysis Prompt Template

```template-analysis
## Instructions
What could be wrong with the code below?
Only consider defects that would lead to incorrect behavior.
The programming language is {{language}}.

## Selected Code
\`\`\`
{{selectedText}}
\`\`\`

## Task
Describe what could be wrong with the code?
Only consider defects that would lead to incorrect behavior.
Provide potential fix suggestions where possible.
Consider that there might not be any problems with the code."
Include code snippets (using Markdown) and examples where appropriate.

## Analysis

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

## Potential Bugs
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
