# Rubberduck - GPT-3 powered chat inside Visual Studio Code

**I'm building this extension in public in the next few days!**

Check out [this Twitter thread](https://twitter.com/lgrammel/status/1618546466678804481) or follow [@lgrammel](https://twitter.com/lgrammel) for updates.

You can find the Visual Studio Code extension here:

- https://marketplace.visualstudio.com/items?itemName=Rubberduck.rubberduck-vscode

## Development

### Setup

1. Install pnpm: `brew install pnpm`
2. Run `pnpm install` to install dependencies
3. Run `pnpm nx run-many --target=build` to build the extension
4. Use "run - app/vscode" inside VSCode to run the extension

### Package extension

1. Run `pnpm nx run vscode:package`
