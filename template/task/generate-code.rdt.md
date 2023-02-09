# Generate Code

Generate code using instructions.

## Template

### Configuration

````json conversation-template
{
  "id": "generate-code",
  "engineVersion": 0,
  "type": "basic-chat",
  "label": "Generate Code",
  "description": "Generate code using instructions.",
  "header": {
    "title": "Generate Code",
    "icon": {
      "type": "codicon",
      "value": "wand"
    }
  },
  "variables": [],
  "chat": {
    "placeholder": "Generating code",
    "prompt": {
      "template": "chat",
      "maxTokens": 2048,
      "stop": ["```"]
    },
    "completionHandler": {
      "type": "update-temporary-editor",
      "botMessage": "Generated code."
    }
  }
}
````

### Chat Prompt

```template-chat
## Instructions
Generate code for the following specification.

## Specification
{{#each messages}}
{{#if (eq author "user")}}
{{content}}
{{/if}}
{{/each}}

## Instructions
Generate code for the specification.

## Code
\`\`\`
```
