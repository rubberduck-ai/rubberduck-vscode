# Usage

## Chat

Chat with Rubberduck about your code and software development topics. Rubberduck knows the editor selection at the time of conversation start.

1. You can start a chat using one of the following options:
   1. Run the `Rubberduck: Start Chat 💬` command from the command palette.
   1. Select the `Start Chat 💬` entry in the editor context menu (right-click, requires selection).
   1. Use the "Start new chat" button in the side panel.
   1. Use the keyboard shortcut: `Cmd + Y` (Mac) or `Ctrl + Y` (Windows / Linux).
   1. Press 💬 on the MacOS touch bar (if available).
1. Ask a question in the new conversation thread in the Rubberduck sidebar panel.

![AI Chat](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-start-chat.png)

## Edit Code

Change the selected code by instructing Rubberduck to create an edit.

1. Select the code that you want to change in the editor.
1. Invoke the "Edit Code" command using one of the following options:

   1. Run the `Rubberduck: Edit Code 💬` command from the command palette.
   1. Select the `Edit Code 💬` entry in the editor context menu (right-click).
   1. Use the keyboard shortcut: `Ctrl + Cmd + E` (Mac) or `Ctrl + Alt + E` (Windows / Linux).

1. Rubberduck will generate a diff view.
1. Provide additional instructions to Rubberduck in the chat thread.
1. When you are happy with the changes, apply them using the "Apply" button in the diff view.

![Edit Code](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-edit-code.png)

## Explain Code

Ask Rubberduck to explain the selected code.

1. Select the code that you want to have explained in the editor.
1. Invoke the "Explain Code" command using one of the following options:
   1. Run the `Rubberduck: Explain Code 💬` command from the command palette.
   1. Select the `Explain Code 💬` entry in the editor context menu (right-click).
1. The explanations shows up in the Rubberduck sidebar panel.

![Explain Code](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-code-explanation.png)

## Generate Tests

Generate test cases with Rubberduck.

1. Select a piece of code in the editor for which you want to generate a test case.
2. Invoke the "Generate Test" command using one of the following options:
   1. Run the `Rubberduck: Generate Test 💬` command from the command palette.
   1. Select the `Generate Test 💬` entry in the editor context menu (right-click).
3. The test case shows up in a new editor tab. You can refine it in the conversation panel.

![Generate Test](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-generate-test.gif)

## Diagnose Errors

Let Rubberduck identify error causes and suggest fixes to fix compiler and linter errors faster.

1. Select a piece of code in the editor that contains errors.
2. Invoke the "Diagnose Errors" command using one of the following options:
   1. Run the `Rubberduck: Diagnose Errors 💬` command from the command palette.
   1. Select the `Diagnose Errors 💬` entry in the editor context menu (right-click).
3. A potential solution will be shown in the chat window. You can refine it in the conversation panel.

![Diagnose Errors](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-diagnose-errors.png)

# Setup

1. Get an OpenAI API key from [beta.openai.com/account/api-keys](https://beta.openai.com/account/api-keys) (you'll need to sign up for an account)
2. Enter the API key with the `Rubberduck: Enter OpenAI API key` command

# Project

**Rubberduck is open source!**

- Repository: [github.com/rubberduck-ai/rubberduck-vscode](https://github.com/rubberduck-ai/rubberduck-vscode)
- Discord: [discord.gg/8KN2HmyZmn](https://discord.gg/8KN2HmyZmn)
- Twitter: Follow [@lgrammel](https://twitter.com/lgrammel) for updates.
