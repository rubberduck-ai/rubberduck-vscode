# Your Own Conversation Templates

You can define your own conversation templates for basic conversations by adding `.json` files to the `.rubberduck/template` folder in your workspace. See the [custom templates in the Rubberduck repository for examples](https://github.com/rubberduck-ai/rubberduck-vscode/tree/main/.rubberduck/template).

You custom conversations are available in the "Rubberduck: Start Custom Chat… 💬" command.

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
- `prompt`: The prompt template for the conversation.

### Selected Code Analysis Chat

Analyze a code selection with an special analysis prompt. Then use a different prompt template for the conversation. The conversation starts with the analysis.

Properties:

- `type: selected-code-analysis-chat`
- `analysisPlaceholder`: The placeholder text that is shown while the analysis is in progress.
- `analysisPrompt`: The prompt template for the analysis.
- `chatTitle`: The title of the conversation. It will be shown in the Rubberduck side panel.
- `chatPrompt`: The prompt template for the conversation.

## Prompt Templates

### Section Types

#### Lines Section

####

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

## Conversation Template Development

You can reload the available conversations with the "Rubberduck: Reload Conversation Types" command. You can see the prompt output in the Output panel. The "Rubberduck: Show logs" command will open the Output panel.
