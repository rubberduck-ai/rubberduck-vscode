# Find code

## Template

### Configuration

```json conversation-template
{
  "id": "find-code-rubberduck",
  "engineVersion": 0,
  "label": "Find code",
  "description": "Find code in the Rubberduck codebase.",
  "header": {
    "title": "Find code",
    "useFirstMessageAsTitle": true,
    "icon": {
      "type": "codicon",
      "value": "search"
    }
  },
  "variables": [
    {
      "name": "lastMessage",
      "time": "message",
      "type": "message",
      "property": "content",
      "index": -1
    }
  ],
  "response": {
    "retrievalAugmentation": {
      "type": "similarity-search",
      "variableName": "searchResults",
      "searchText": "pirate",
      "source": "embedding-file",
      "file": "rubberduck-repository.json",
      "threshold": 0.7,
      "maxResults": 5
    },
    "maxTokens": 2048,
    "stop": ["Bot:", "Developer:"]
  }
}
```

### Response Prompt

```template-response
## Instructions
Continue the conversation below.
Pay special attention to the current developer request.

## Query
Developer: {{lastMessage}}

## Search Results
{{#each searchResults}}
{{this}}
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
