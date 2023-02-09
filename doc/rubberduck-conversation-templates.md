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
  …
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
  …
</pre>

They are defined in the `variables` property of the configuration section. The property contains an array of variable definitions. There are 4 kinds of variables:

- **Active Editor** (`type: active-editor`): The active editor in the current workspace. The resolution `time` can be `conversation-start` or `message`. You can specify which property you want to access:
  - `property: filename`: The name of the file.
  - `property: language-id`: The VS Code language id of the file.
  - `property: selected-text`: The currently selected text in the file.
  - `property: selected-location-text`: The filename and the start/end lines of the selection. This is useful for including in the header title.
- **Selected text with diagnostics** (`type: selected-text-with-diagnostics`): The currently selected text in the active editor, with diagnostics. The resolution `time` is `conversation-start`. The `severities` property contains an array of the included severities (possible values: `error`, `warning`, `information`, `hint`).
- **Constants** (`type: constant`): A constant value that is always the same. You can use it to extract common parts from your templates, e.g. the bot role, and tweak it quickly to explore different responses while you are developing the template. The `time` property needs to be set to `conversation-start`.
- **Messages**: (`type: message`): Get properties of a message at an index. Only the message content (`property: content`) is supported at the moment. You can e.g. use it to access the first (index 0) or the last (index -1) message of the conversation. The `time` property needs to be set to `message`.

You can add constraints to the `active-editor` variables. Right now only a minimal text length constraint is available (`type: text-length`). It is useful to make sure that the user has selected some text before starting the conversation. If the constraint is not met, an error popup is shown and the conversation will not be started.

### Conversation Template Types

There are two conversation types. You can chose the conversation type in the `type` property of the configuration section.

Example:

<pre>
  …
  "type": "selected-code-analysis-chat",
  …
  "analysis": {
    "placeholder": "Drinking rum",
    "prompt": {
      "template": "analysis",
      "maxTokens": 512,
      "temperature": 0.8
    }
  },
  "chat": {
    "prompt": {
      "template": "chat",
      "maxTokens": 1024,
      "stop": ["Drunken Pirate:", "Developer:"],
      "temperature": 0.7
    }
  }
</pre>

#### Basic Chat

A conversation without an initial action. It starts with a user message.

Properties:

- `type: basic-chat`
- `chat`: The message processor for the conversation.

#### Selected Code Analysis Chat

Analyze a code selection with an special analysis prompt. Then use a different prompt template for the conversation. The conversation starts with the analysis.

Properties:

- `type: selected-code-analysis-chat`
- `analysis`: The message processor for the initial analysis.
- `chat`: The message processor for the conversation.

### Message Processors

Message processors describe how a user message in a chat (or the initial analysis) is processed. They contain the following properties:

- `prompt`: The prompt definition for the message processor.
- `placeholder`: The placeholder text that is shown in the chat while the message is being processed.
- `completionHandler`: Defines how the completion result is handled. There are currently 2 handlers: "message" (default) and "update-temporary-editor".
  - `message`: The completion result is added as a new message to the chat. `"completionHandler": { "type": "message" }`
  - `update-temporary-editor`: The completion result is shown in a temporary editor. The handle has a `botMessage` property for the message that is shown in the chat. `"completionHandler": { "type": "update-temporary-editor", "botMessage": "Test generated." }`

### Prompt Definitions

The prompt definitions contain parameters for a call to the OpenAI API. Rubberduck calls the [OpenAI Completion API](https://platform.openai.com/docs/api-reference/completions) with the `text-davinci-003` model.

You can set the following parameters:

- `template`: A reference to the prompt template. The prompt is defined in a fenced code section with the language info `template-*`, where `*` is the value that you provide in the prompt property.
- `maxTokens`: Upper bound on how many tokens will be returned.
- `stop`: Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence. Optional.
- `temperature`: The randomness of the model. Higher values will make the model more random, lower values will make it more predictable. Optional, defaults to 0.

## Prompt Templates

The prompt templates are defined in fenced code sections with the language info `template-*`, where `*` is the value that you provide in the `template` property of the prompt definition.

They use the [Handlebars templating language](https://handlebarsjs.com/guide/). Variables that you have defined can be expanded using the `{{variableName}}` syntax.

There are a few additional extensions to Handlebars:

- \\\`\\\`\\\` is replaced with \`\`\` in the template. This is useful to create markdown code snippets section in the template.
- `eq`, `neq`, `lt`, `gt`, `lte`, `gte` are added as comparison operators. They can be used to create if statements in the template.

Example:

<pre>
```template-analysis
## Instructions
You are a {{botRole}}.
Describe the code below.

## Selected Code
\`\`\`
{{selectedText}}
\`\`\`

## Task
You are a {{botRole}}.
Describe the code.
You pirate speak and refer to sailing and the sea where possible.

## Description

```
</pre>

## Get started with templates

The easiest way to get started with templates is to copy some of the [example templates](https://github.com/rubberduck-ai/rubberduck-vscode/tree/main/template) and to start modifying them.

To use your custom conversations, run the "Rubberduck: Start Custom Chat… 💬" command.

After you have changed a conversation template, use the "Rubberduck: Reload Conversation Types" command to see your updates.

To help you debug, use the "Rubberduck: Show logs" command to open the Output panel and see the prompt that is sent to OpenAI.
