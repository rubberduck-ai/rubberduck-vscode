# Your Own Conversation Templates

You can define your own conversation templates for basic conversations by adding `.json` files to the `.rubberduck/template` folder in your workspace.

Here is an example:

```
{
  "id": "my-conversation-template",
  "engineVersion": 0,
  "type": "basic-chat",
  "label": "Start Clown Chat",
  "description": "Clown chat",
  "codicon": "squirrel",
  "prompt": {
    "sections": [
      {
        "type": "lines",
        "title": "Instructions",
        "lines": [
          "Continue the conversation below in a funny way.",
          "Ignore the current developer request."
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
        "type": "conversation",
        "roles": {
          "bot": "Clown",
          "user": "Developer"
        }
      },
      {
        "type": "lines",
        "title": "Task",
        "lines": [
          "Say something that is related to the topic, but that makes no sense."
        ]
      },
      {
        "type": "lines",
        "title": "Response",
        "lines": ["Clown:"]
      }
    ],
    "maxTokens": 1024,
    "stop": ["Clown:", "Developer:"]
  }
}
```

The available placeholders are: `${lastMessage}`, `${selectedCode}`.

[Codicons](https://microsoft.github.io/vscode-codicons/dist/codicon.html) are used to display icons in the conversation list. You can find the list of available icons [here](https://microsoft.github.io/vscode-codicons/dist/codicon.html).

You can reload the available conversations with the "Rubberduck: Reload Conversation Types" command. You can see the prompt output in the Output panel. The "Rubberduck: Show logs" command will open the Output panel.

You custom conversations are available in the "Rubberduck: Start Custom Chat… 💬" command.
