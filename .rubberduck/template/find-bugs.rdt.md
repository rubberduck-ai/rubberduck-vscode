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
      "type": "sections",
      "sections": [
        {
          "type": "lines",
          "title": "Instructions",
          "lines": [
            "What could be wrong with the code below?",
            "Only consider defects that would lead to incorrect behavior.",
            "The programming language is ${language}."
          ]
        },
        {
          "type": "optional-selected-code",
          "title": "Selected Code"
        },
        {
          "type": "lines",
          "title": "Task",
          "lines": [
            "Describe what could be wrong with the code?",
            "Only consider defects that would lead to incorrect behavior.",
            "Provide potential fix suggestions where possible.",
            "Consider that there might not be any problems with the code.",
            "Include code snippets (using Markdown) and examples where appropriate."
          ]
        },
        {
          "type": "lines",
          "title": "Analysis",
          "lines": []
        }
      ]
    },
    "maxTokens": 1024
  },
  "chatTitle": "Find bugs",
  "chatPrompt": {
    "template": {
      "type": "sections",
      "sections": [
        {
          "type": "lines",
          "title": "Instructions",
          "lines": [
            "Continue the conversation below.",
            "Pay special attention to the current developer request.",
            "The programming language is ${language}."
          ]
        },
        {
          "type": "lines",
          "title": "Current Request",
          "lines": ["Developer: ${lastMessage}"]
        },
        {
          "type": "optional-selected-code",
          "title": "Selected Code"
        },
        {
          "type": "lines",
          "title": "Potential Bugs",
          "lines": ["${firstMessage}"]
        },
        {
          "type": "conversation",
          "excludeFirstMessage": true,
          "roles": {
            "bot": "Bot",
            "user": "Developer"
          }
        },
        {
          "type": "lines",
          "title": "Task",
          "lines": [
            "Write a response that continues the conversation.",
            "Stay focused on current developer request.",
            "Consider the possibility that there might not be a solution.",
            "Ask for clarification if the message does not make sense or more input is needed.",
            "Use the style of a documentation article.",
            "Omit any links.",
            "Include code snippets (using Markdown) and examples where appropriate."
          ]
        },
        {
          "type": "lines",
          "title": "Response",
          "lines": ["Bot:"]
        }
      ]
    },
    "maxTokens": 1024,
    "stop": ["Bot:", "Developer:"]
  }
}
```
