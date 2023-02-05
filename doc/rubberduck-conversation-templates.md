# Rubberduck Conversation Templates

Rubberduck comes with handy built-in commands, such as Explain Code, Edit Code, Generate Tests,etc.

But what if you have a specific need that isn't quite covered? What if you want to craft an AI Chat that knows specifically about your project, or your conventions? How cool would it be to have the answers in your own language?

That's what you can get with Rubberduck Conversation Templates! 🌈

Here are some ideas of what you can do with them:

- Have conversations in a different language, e.g. [in French](https://github.com/rubberduck-ai/rubberduck-vscode/blob/main/template/chat-i18n/chat-fr.rdt.md)
- Let [Shakespeare write a sonnet about your code](https://github.com/rubberduck-ai/rubberduck-vscode/blob/main/template/fun/code-sonnet.rdt.md)
- Define dedicated tasks, e.g. [improving code readability](https://github.com/rubberduck-ai/rubberduck-vscode/blob/main/template/task/improve-readability.rdt.md)
- Create project, language or framework-specific conversation templates

The best part of it: you can share them around with your colleagues, your friends, or your enemies.

## How to define your own templates?

By adding Rubberduck Template File (`.rdt.md`) files to the `.rubberduck/template` folder in your workspace. See the [templates in the Rubberduck repository for examples](https://github.com/rubberduck-ai/rubberduck-vscode/tree/main/template).

To use your custom conversations, run the "Rubberduck: Start Custom Chat… 💬" command.

After you have changed a conversation template, use the "Rubberduck: Reload Conversation Types" command to see your updates.

To help you debug, use the "Rubberduck: Show logs" command to open the Output panel and see the prompt that is sent to OpenAI.

## Example: Drunken Pirate

The ["Drunken Pirate" template](https://github.com/rubberduck-ai/rubberduck-vscode/blob/main/template/fun/drunken-pirate.rdt.md) will expose a new custom conversation: **Ask a drunken pirate to describe your code**.

To see it in action:

1. Save the template as `.rubberduck/template/drunken-pirate.rdt.md` in your workspace
2. Use "Rubberduck: Reload Conversation Types"
3. Use "Rubberduck: Start Custom Chat… 💬"
4. Pick "Ask a drunken pirate"

This template is a conversation between a developer and a drunken pirate. The drunken pirate starts by describing the selected code.

Want to craft your own? Let's dig into how Rubberduck Conversation Templates are structured.

## Rubberduck Conversation Template Structure

Rubberduck Conversation Templates are [GitHub-flavored Markdown](https://github.github.com/gfm/) files with special fenced code sections. You can use regular markdown to document your template, and use the fenced code sections to define the template itself.

There are two types of fenced code sections:

- the `json conversation-template` configuration section
- the `template-*` prompt template sections

## Configuration Section

The configuration section is a JSON object that defines the template. It is a fenced code block with the language `json conversation-template`:

<pre>
```json conversation-template
{
    "id": "drunken-pirate",
    "engineVersion": 0,
    "label": "Ask a drunken pirate",
    "description": "Ask a drunken pirate about the meaning of your code",
    "header": {
      "title": "Drunken Pirate ({{location}})",
      "icon": {
        "type": "codicon",
        "value": "feedback"
      }
    },
    …
}

```
</pre>

### Basic Properties

Configuration sections have the basic following properties:

- `id`: Id of the conversation type. It needs to be unique.
- `engineVersion`: Must be 0 for now. Warning: we might make breaking changes to the template format while we are on version 0.
- `label`: Short description of the conversation type. It will be displayed when you run the "Rubberduck: Start Custom Chat… 💬" command.
- `description`: Longer description of the conversation type. It will be displayed when you run the "Rubberduck: Start Custom Chat… 💬" command.
- `header`: The header that is shown in the Rubberduck side panel for conversations of this type. It has 3 properties:
  - `title`: The title of the conversation. It will be shown in the Rubberduck side panel. You can use [template variables](#variables) here with `{{variableName}}`.
  - `useFirstMessageAsTitle`: An optional boolean value. Defaults to `false`. If it is `true`, the first message of the conversation will be used as the title once there is a message.
  - `icon`: The icon that is shown in the Rubberduck side panel for conversations of this type. Only the [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html) `type` is supported at the moment. You can set the `value` property to the codicon that you want to show.
- `isEnabled`: Whether the conversation type is enabled. If it is disabled, it will not be shown in the "Rubberduck: Start Custom Chat… 💬" command. Defaults to `true`.

### Variables

Variables are values that you can expand in the header title and in the prompt templates using the `{{variableName}}` syntax. Here is an example:

<pre>
  "variables": [
    {
      "name": "selectedText",
      "type": "active-editor",
      "property": "selected-text",
      "constraints": [{ "type": "text-length", "min": 1 }]
    },
    {
      "name": "location",
      "type": "active-editor",
      "property": "selected-location-text"
    },
    {
      "name": "lastMessage",
      "type": "message",
      "property": "content",
      "index": -1
    },
    {
      "name": "botRole",
      "type": "constant",
      "value": "drunken pirate"
    }
  ],
</pre>

They are defined in the `variables` property of the configuration section. The property contains an array of variable definitions. There are 3 kinds of variables:

- **Active Editor** (`type: active-editor`): The active editor in the current workspace. You can specify which property you want to access:
  - `property: filename`: The name of the file.
  - `property: language-id`: The VS Code language id of the file.
  - `property: selected-text`: The currently selected text in the file.
  - `property: selected-location-text`: The filename and the start/end lines of the selection. This is useful for including in the header title.
- **Constants** (`type: constant`): A constant value that is always the same. You can use it to extract common parts from your templates, e.g. the bot role, and tweak it quickly to explore different responses while you are developing the template.
- **Messages**: (`type: message`): Get properties of a message at an index. Only the message content (`property: content`) is supported at the moment. You can e.g. use it to access the first (index 0) or the last (index -1) message of the conversation.

You can add constraints to the `active-editor` variables. Right now only a minimal text length constraint is available (`type: text-length`). It is useful to make sure that the user has selected some text before starting the conversation. If the constraint is not met, an error popup is shown and the conversation will not be started.

## Conversation Template Types

**WARNING: CONTENT BELOW IS OUTDATED**

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
- `temperature`: A number between 0 and 1. 1 means the model will take more risks and be more creative. Defaults to 0. [Comes from OpenAI](https://platform.openai.com/docs/api-reference/completions/create#completions/create-temperature)

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

```

```
