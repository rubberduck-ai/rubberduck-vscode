# Document Code

Document the selected code.

## Template

### Configuration

````json conversation-template
{
  "id": "document-code",
  "engineVersion": 0,
  "type": "selected-code-analysis-chat",
  "label": "Document Code",
  "description": "Document the selected code.",
  "header": {
    "title": "Document Code {{location}}",
    "icon": {
      "type": "codicon",
      "value": "output"
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
    }
  ],
  "analysis": {
    "placeholder": "Documenting selection",
    "prompt": {
      "template": "analysis",
      "maxTokens": 2048,
      "stop": ["```"]
    },
    "completionHandler": {
      "type": "active-editor-diff",
      "botMessage": "Generated documentation."
    }
  },
  "chat": {
    "placeholder": "Documenting selection",
    "prompt": {
      "template": "chat",
      "maxTokens": 2048,
      "stop": ["```"]
    },
    "completionHandler": {
      "type": "active-editor-diff",
      "botMessage": "Generated documentation."
    }
  }
}
````

### Analysis Prompt

```template-analysis
## Instructions
Document the code on function/method/class level.
Avoid line comments.
The programming language is {{language}}.

## Code
\`\`\`
{{selectedText}}
\`\`\`

## Documented Code
\`\`\`

```

### Chat Prompt

```template-chat
## Instructions
Document the code on function/method/class level.
Avoid line comments.
The programming language is {{language}}.

Consider the following instructions:
{{#each messages}}
{{#if (eq author "user")}}
{{content}}
{{/if}}
{{/each}}

## Code
\`\`\`
{{selectedText}}
\`\`\`

## Documented Code
\`\`\`

```
