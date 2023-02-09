# Generate Unit Test

Generate unit test cases for the selected code.

## Conversation Template

### Configuration

````json conversation-template
{
  "id": "generate-unit-test",
  "engineVersion": 0,
  "type": "selected-code-analysis-chat",
  "label": "Generate Unit Test",
  "description": "Generate a unit test for the selected code.",
  "header": {
    "title": "Generate Unit Test ({{location}})",
    "icon": {
      "type": "codicon",
      "value": "beaker"
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
      "name": "lastMessage",
      "time": "message",
      "type": "message",
      "property": "content",
      "index": -1
    }
  ],
  "analysis": {
    "placeholder": "Generating Test",
    "prompt": {
      "template": "analysis",
      "maxTokens": 1536,
      "stop": ["```"]
    },
    "completionHandler": {
      "type": "update-temporary-editor",
      "botMessage": "Generated unit test.",
      "language": "{{language}}"
    }
  },
  "chat": {
    "placeholder": "Updating Test",
    "prompt": {
      "template": "chat",
      "maxTokens": 1536,
      "stop": ["```"]
    },
    "completionHandler": {
      "type": "update-temporary-editor",
      "botMessage": "Updated unit test.",
      "language": "{{language}}"
    }
  }
}
````

### Analysis Prompt Template

```template-analysis
## Instructions
Write a unit test for the code below.

## Selected Code
\`\`\`
{{selectedText}}
\`\`\`

## Task
Write a unit test that contains test cases for the happy path and for all edge cases.
The programming language is {{language}}.

## Unit Test
\`\`\`

```

### Chat Prompt Template

```template-chat
## Instructions
Rewrite the code below as follows: "{{lastMessage}}"

## Code
\`\`\`
{{temporaryEditorContent}}
\`\`\`

## Task
Rewrite the code below as follows: "{{lastMessage}}"

## Answer
\`\`\`

```
