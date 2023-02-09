# Edit Code

Generate code using instructions.

## Template

### Configuration

````json conversation-template
{
  "id": "edit-code",
  "engineVersion": 0,
  "type": "basic-chat",
  "label": "Edit Code",
  "description": "Instruct Rubberduck to edit the code. Creates a diff that you can review.",
  "header": {
    "title": "Edit Code {{location}}",
    "icon": {
      "type": "codicon",
      "value": "edit"
    }
  },
  "variables": [
    {
      "name": "selectedText",
      "time": "conversation-start",
      "type": "active-editor",
      "property": "selected-text",
      "constraints": [{ "type": "text-length", "min": 1 }]
    }
  ],
  "chat": {
    "placeholder": "Generating edit",
    "prompt": {
      "template": "chat",
      "maxTokens": 1536,
      "stop": ["```"]
    },
    "completionHandler": {
      "type": "active-editor-diff",
      "botMessage": "Generated edit."
    }
  }
}
````

### Chat Prompt

```template-chat
## Instructions
Edit the code below as follows:
{{#each messages}}
{{#if (eq author "user")}}
{{content}}
{{/if}}
{{/each}}

## Code
\`\`\`
{{selectedText}}
\`\`\`

## Answer
\`\`\`

```
