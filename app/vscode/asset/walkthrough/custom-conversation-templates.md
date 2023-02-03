# Your Own Conversation Templates

Rubberduck comes with handy built-in commands, such as:

- Explain Code
- Edit Code
- Generate Tests
- etc.

But what if you have a specific need that isn't quite covered? What if you want to craft an AI Chat that knows specifically about your project, or your conventions? How cool would it be to have the answers in your own language?

That's what you can get with Custom Conversation Templates! 🌈

The best part of it: you can share them around with your colleagues, your friends, or your enemies.

## How to define your own templates?

By adding `.json` files to the `.rubberduck/template` folder in your workspace. See the [custom templates in the Rubberduck repository for examples](https://github.com/rubberduck-ai/rubberduck-vscode/tree/main/.rubberduck/template).

To use custom conversations, run the "Rubberduck: Start Custom Chat… 💬" command.

After you have changed a conversation template, use the "Rubberduck: Reload Conversation Types" command to see your updates.

To help you debug, use the "Rubberduck: Show logs" command to open the Output panel and see the prompt that is sent to OpenAI.

## Example

This template will expose a new custom conversation: **Ask a drunken pirate**.

To see it in action:

1. Save it in `.rubberduck/template/describe-code-as-drunken-pirate.json` in your project
2. Use "Rubberduck: Reload Conversation Types"
3. Use "Rubberduck: Start Custom Chat… 💬"
4. Pick "Ask a drunken pirate"

```json
{
  "id": "describe-code-as-drunken-pirate",
  "engineVersion": 0,
  "type": "selected-code-analysis-chat",
  "label": "Ask a drunken pirate",
  "description": "Ask a drunken pirate about the meaning of your code",
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
  "analysisPlaceholder": "Thinking",
  "analysisPrompt": {
    "sections": [
      {
        "type": "lines",
        "title": "Instructions",
        "lines": [
          "Pretend that you are a drunken pirate.",
          "Describe the code below."
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
          "Pretend that you are a drunken pirate.",
          "Describe the code.",
          "You pirate speak and refer to sailing and the sea where possible."
        ]
      },
      {
        "type": "lines",
        "title": "Description",
        "lines": []
      }
    ],
    "maxTokens": 512,
    "temperature": 0.8
  },
  "chatTitle": "Drunken pirate",
  "chatPrompt": {
    "sections": [
      {
        "type": "lines",
        "title": "Instructions",
        "lines": [
          "Continue the conversation.",
          "Pretend that you are a drunken pirate."
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
          "bot": "Drunken Pirate",
          "user": "Developer"
        }
      },
      {
        "type": "lines",
        "title": "Task",
        "lines": [
          "Write a response that continues the conversation.",
          "Pretend that you are a drunken pirate.",
          "You pirate speak and refer to sailing and the sea where possible."
        ]
      },
      {
        "type": "lines",
        "title": "Answer",
        "lines": ["Drunken Pirate:"]
      }
    ],
    "maxTokens": 1024,
    "stop": ["Drunken Pirate:", "Developer:"],
    "temperature": 0.7
  }
}
```

Want to craft your own? Let's dig into how these JSON are structured.

## Basic Configuration

Properties

- `id`: Id of the conversation type. It needs to be unique.
- `engineVersion`: Must be 0 for now. Warning: we might make breaking changes to the template format while we are on version 0.
- `label`: Short description of the conversation type. It will be displayed when you run the "Rubberduck: Start Custom Chat… 💬" command.
- `description`: Longer description of the conversation type. It will be displayed when you run the "Rubberduck: Start Custom Chat… 💬" command.
- `icon`: The icon that is shown in the Rubberduck side panel for conversations of this type. Only the [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html) type is supported at the moment.
- `isEnabled`: Whether the conversation type is enabled. If it is disabled, it will not be shown in the "Rubberduck: Start Custom Chat… 💬" command. Defaults to `true`.
- `initVariableRequirements`: An array of variable requirements that need to be fulfilled before the conversation can be started. Use it to e.g. require a selection in the active editor.

## Conversation Template Types

### Basic Chat

A conversation without an initial action. It starts with a user message.

Properties:

- `type: basic-chat`
- `prompt`: The prompt template](#prompt-templates) for the conversation.

### Selected Code Analysis Chat

Analyze a code selection with an special analysis prompt. Then use a different prompt template for the conversation. The conversation starts with the analysis.

Properties:

- `type: selected-code-analysis-chat`
- `analysisPlaceholder`: The placeholder text that is shown while the analysis is in progress.
- `analysisPrompt`: The [prompt template](#prompt-templates) for the analysis.
- `chatTitle`: The title of the conversation. It will be shown in the Rubberduck side panel.
- `chatPrompt`: The prompt template](#prompt-templates) for the conversation.

## Prompt Templates

Build a prompt to send to OpenAI. This is how you can craft useful commands under the hood, so the user doesn't have to craft the perfect prompt themselves!

Properties:

- `sections`: The final prompt is broke down into smaller [section types](#section-types) that you compose together. This allows you to insert user selected code in the middle of your prompt.
- `maxTokens`: Upper bound on how many [OpenAI tokens](https://platform.openai.com/tokenizer) the API will return. [Comes from OpenAI](https://platform.openai.com/docs/api-reference/completions/create#completions/create-max_tokens).
- `stop`: Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence. [Comes from OpenAI](https://platform.openai.com/docs/api-reference/completions/create#completions/create-stop).
- `temperature`: A number between 0 and 1. 1 means the model will take more risks and be more creative. [Comes from OpenAI](https://platform.openai.com/docs/api-reference/completions/create#completions/create-temperature)

### Section Types

Sections are composed together to form a prompt.

There are different types of sections that you can build.

#### Lines Section

This section allows you to provide text content for the prompt. Add as many lines as you want. You can include user inputs from [variables](#variables).

Properties:

- `type: lines`
- `title`: Title of this section. It gives context for the model to answer.
- `lines`: List of strings that represent the lines of text you want to send to the model. You can use [the available variables](#variables)

#### Optionally Selected Code

This section will include the code that is currently selected by the user, if it exists.

Properties:

- `type: optional-selected-code`
- `title`: Title of this section. It gives context for the model to answer.

#### Conversation

This section creates a role-play conversation between the model and the user. This is handy to ask the model to continue the conversation, so it provides an answer to the user.

Properties:

- `type: conversation`
- `excludeFirstMessage`: Optional. If `true`, then it will omit the first user message in the prompt.
- `roles`: A [role object](#roles)

##### Roles

- `bot`: Name of the model in the conversation
- `user`: Name of the user in the conversation

### Variables

The available variables are:

- `${selectedCode}` - the selected code from the active editor
- `${language}` - the language id of the document in the active editor
- `${firstMessage}` - the first message of the conversation (text only) or `undefined` if there are no messages
- `${lastMessage}` - the last message of the conversation (text only) or `undefined` if there are no messages

### Settings

- `maxTokens`: The maximum number of tokens that can be generated from the prompt.
- `stop`: An array of tokens that will stop the conversation. Optional.
- `temperature`: The temperature of the prompt. Optional. Defaults to 0. Set to e.g. 0.5 to get more creative responses.
