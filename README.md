# Rubberduck - GPT-3 powered chat inside Visual Studio Code

## Resources

- [Extension - Visual Studio Code marketplace](https://marketplace.visualstudio.com/items?itemName=Rubberduck.rubberduck-vscode)
- [Rubberduck Discord](https://discord.gg/8KN2HmyZmn)

## Functionality

### AI Chat

![Chat](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-start-chat.png)

## Edit Code

![Edit Code](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-edit-code.png)

### Explain Code

![Explain Code](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-code-explanation.png)

### Generate Tests

![Generate Tests](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-generate-test.gif)

## Diagnose Errors

![Diagnose Errors](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-diagnose-errors.png)

## Development Guide

### Setup

1. Install pnpm: `brew install pnpm`
2. Run `pnpm install` to install dependencies
3. Run `pnpm nx run-many --target=build` to build the extension
4. Use "run - app/vscode" inside VSCode to run the extension

Once you have completed these steps, you should be able to run and develop the extension.

### Commands

- **Lint**: `pnpm nx lint --skip-nx-cache`
- **Package**: `pnpm nx run vscode:package`
- **Test**: `pnpm nx run extension:test`
