# Changelog

## 1.8.3 - 2023-02-11

### Changed

- **Breaking**. Rubberduck Templates: Changed variable 'activeEditor' into several new variables and removed it.

### Fixed

- Diagnose errors, explain code, and find bugs were not working in 1.8.2. Fixed.

## 1.8.2 - 2023-02-11

### Changed

- In instruction fields, enter creates a newlines. Shift+Enter or Ctrl+Enter submits the instructions. In messages, enter submits the message.
- **Breaking**. Rubberduck Templates: Removed `type` property and related fields. Introduced `initialMessage` and `response` properties that contain flattened prompt and additional information.

## 1.8.0 - 2023-02-10

### Added

- Shortcut `Ctrl + Cmd + G` (Mac) or `Ctrl + Alt + G` (Windows / Linux) to generate code.
- Rubberduck Templates: "chatInterface" property for conversation templates.

### Changed

- Generate code, generate unit test and edit code now use an instruction refinement chat interface.

### Fixed

- Streaming sometimes led to errors. Fixed.

## 1.7.2 - 2023-02-10

### Added

- Streaming for code generation.

## 1.7.0 - 2023-02-10

### Added

- Streaming for basic chat messages.

### Fixed

- Generate unit test was not working. Fixed.

## 1.6.1 - 2023-02-09

### Added

- Notification when you reload your workspace templates.
- Rubberduck Templates: "active-editor-diff" completion handler.

## 1.6.0 - 2023-02-09

### Added

- "Generate code" action
- Rubberduck Templates: "completionHandler" configuration

### Fixed

- Inconsistent font size for embedded code (Issue #8)
- "Edit Code" follow-up suggestions aren't applied to code (Issue #14)

## 1.5.0 - 2023-02-07

### Changed

- New diff viewer with side-by-side diffs.

### Fixed

- Past messages were not resolved included in the prompt.

## 1.4.1 - 2023-02-07

### Fixed

- Template variables were not resolved correctly, leading to abandoned conversations.

### Changed

- **Breaking**. Add "time" property to variable definitions.

## 1.4.0 - 2023-02-06

### Added

- "Find bugs" conversation.

### Fixed

- Conversation prompts were not including messages.

## 1.3.0 - 2023-02-05

### Changed

- **Breaking**. The Rubberduck Conversation format has changed in large parts. [Check the updated docs](https://github.com/rubberduck-ai/rubberduck-vscode/blob/main/doc/rubberduck-templates.md) for Rubberduck Templates.

## 1.2.0 - 2023-02-03

### Changed

- **Breaking**. The `codicon` attribute is now an `icon` property. [Check the updated docs](https://github.com/rubberduck-ai/rubberduck-vscode/blob/main/doc/rubberduck-templates.md) for Rubberduck Templates.

### Added

- New `selected-code-analysis-chat` template format. It analyzes a code selection, then starts a conversation. Use-case example:
  - [Improve readability](https://github.com/rubberduck-ai/rubberduck-vscode/tree/main/.rubberduck/template/improve-readability.json)
  - [Find bugs](https://github.com/rubberduck-ai/rubberduck-vscode/tree/main/.rubberduck/template/find-bugs.json)
- New optional `isEnabled` flag, so you can disable a Rubberduck Template you are still working on.

## 1.1.0 - 2023-02-02

### Added

- Add your own custom Rubberduck Templates by adding `.json` files to the `.rubberduck/template` folder in your workspace.
- The "Rubberduck: Reload Templates" command reloads the conversation types. You can use it after you modified or added custom conversations in your workspace.
- Prompts are logged and can be inspected in the output tab. The "Rubberduck: Show Logs" shows the Rubberduck output tab.
- The "Rubberduck: Start Custom Chat… 💬" command allows you to select a chat from a list of available options. It includes custom conversation types.

## 1.0.1 - 2023-02-01

### Fixed

- Incorrect description of diagnose errors. Thanks @iainvm for the fix!

## 1.0.0 - 2023-02-01

- First major release! Only minor README changes.

## 0.8.5 - 2023-01-31

### Fixed

- When creating a edit, sometimes no diff was shown. Fixed.

## 0.8.0 - 2023-01-30

### Added

- "Remove conversation" button.

## 0.7.2 - 2023-01-30

### Added

- Chat panel icons for creating chats and for accessing the walkthrough.

## 0.7.1 - 2023-01-30

### Changed

- Changed the "Edit Code" shortcut to CTRL + ALT/CMD + E.

## 0.7.0 - 2023-01-30

### Added

- CTRL/CMD + M keyboard shortcut to start code editing.

### Fixed

- Several bugs.

## 0.6.1 - 2023-01-30

### Added

- Show information messages when commands cannot be executed.

## 0.6.0 - 2023-01-30

### Added

- Add walkthrough.

## 0.5.0 - 2023-01-30

### Added

- "Edit code" command.

## 0.4.0 - 2023-01-29

### Added

- "Diagnose errors" command.

## 0.3.2 - 2023-01-28

### Added

- OpenAI error handling and retry.

## 0.3.1 - 2023-01-28

### Improved

- Cleaner UI.
- Improved prompts for better answers.
- Test refinement uses the current test code.

## 0.3.0 - 2023-01-28

### Added

- "Generate Test" uses the conversation interface. You can refine tests by talking to the bot.

## 0.2.0 - 2023-01-28

### Added

- "Explain code" and "Start chat" contain information about the editor selection.

## 0.1.0 - 2023-01-27

### Added

- "Start new chat" button in the side panel
- CTRL/CMD + Y keyboard shortcut to start a new chat
- Touch bar support (MacOS only)
- "Explain code" and "Write test" command in the editor context menu

## 0.0.9 - 2023-01-27

### Added

- "Start chat" command

## 0.0.8 - 2023-01-27

### Improved

- Add support for Visual Studio Code 1.72

## 0.0.7 - 2023-01-27

### Added

- Chat with the Bot about code explanations.

## 0.0.6 - 2023-01-26

### Added

- "Write test" command

## 0.0.1 - 2023-01-26

### Added

- "Explain code" command
