![Rubberduck AI Chat](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/asset/rubberduck-header-2.gif)

# Rubberduck: ChatGPT for Visual Studio Code

> &nbsp;
>
> #### AI chat in the Visual Studio Code side bar. Rubberduck can [generate code](#generate-code), [edit code](#edit-code), [explain code](#explain-code), [generate tests](#generate-tests), [find bugs](#find-bugs), [diagnose errors](#diagnose-errors), and more. You can even add [your own conversation templates](#custom-conversations).
>
> &nbsp;

<!-- prettier-ignore-start -->
[![Marketplace](https://vsmarketplacebadges.dev/version-short/Rubberduck.rubberduck-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=Rubberduck.rubberduck-vscode)
[![Marketplace Installs](https://vsmarketplacebadges.dev/installs-short/Rubberduck.rubberduck-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=Rubberduck.rubberduck-vscode)
[![Marketplace Rating](https://vsmarketplacebadges.dev/rating/Rubberduck.rubberduck-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=Rubberduck.rubberduck-vscode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Twitter](https://img.shields.io/twitter/url/https/twitter.com/rubberduckai.svg?style=social&label=%20%40rubberduckai)](https://twitter.com/rubberduckai)
[![Discord](https://discordapp.com/api/guilds/1061938502327091271/widget.png?style=shield)](https://discord.gg/8KN2HmyZmn)<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-10-orange.svg?style=flat-square)](#contributors)
<!-- ALL-CONTRIBUTORS-BADGE:END --> 

<!-- prettier-ignore-end -->

## Quick Install

You can install Rubberduck from the

- [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Rubberduck.rubberduck-vscode)
- [Open VSX Registry](https://open-vsx.org/extension/Rubberduck/rubberduck-vscode)

Rubberduck requires an OpenAI API key. You can get an OpenAI API key from [platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys) (you'll need to sign up for an account).

## Features

[AI Chat](#ai-chat) | [Generate Code](#generate-code) | [Edit Code](#edit-code) | [Explain Code](#explain-code) | [Generate Tests](#generate-tests) | [Find Bugs](#find-bugs) | [Diagnose Errors](#diagnose-errors) | [Custom Conversations](#custom-conversations)

### AI Chat

Chat with Rubberduck about your code and software development topics. Rubberduck knows the editor selection at the time of conversation start.

![Chat](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-start-chat.png)

# Generate Code

Instruct Rubberduck to generate code for you.

![Generate Code](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-generate-code.gif)

## Edit Code

Change the selected code by instructing Rubberduck to create an edit.

![Edit Code](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-edit-code.gif)

### Explain Code

Ask Rubberduck to explain the selected code.

![Explain Code](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-code-explanation.png)

### Generate Tests

Generate test cases for the selected code.

![Generate Tests](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-generate-test.gif)

## Find Bugs

Find potential defects in your code.

![Find Bugs](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-find-bugs.png)

### Diagnose Errors

Let Rubberduck identify error causes and suggest fixes to fix compiler and linter errors faster.

![Diagnose Errors](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/screenshot-diagnose-errors.gif)

### Custom Conversations

You can define your own conversation templates. See the [Rubberduck Template docs](https://github.com/rubberduck-ai/rubberduck-vscode/blob/main/doc/rubberduck-templates.md) for more information.

Here is an example of a [drunken pirate describing your code](https://github.com/rubberduck-ai/rubberduck-vscode/blob/main/template/fun/drunken-pirate.rdt.md):

![Describe code as a drunken pirate](https://raw.githubusercontent.com/rubberduck-ai/rubberduck-vscode/main/app/vscode/asset/media/drunken-pirate.gif)

## Configuration Options

- **rubberduck.syntaxHighlighting.useVisualStudioCodeColors**: Use the Visual Studio Code Theme colors for syntax highlighting in the diff viewer. Might not work with all themes. Default is `false`.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="25%"><a href="http://larsgrammel.de"><img src="https://avatars0.githubusercontent.com/u/205036?v=4?s=100" width="100px;" alt="Lars Grammel"/><br /><sub><b>Lars Grammel</b></sub></a><br /><a href="#ideas-lgrammel" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/rubberduck-ai/rubberduck-vscode/commits?author=lgrammel" title="Code">💻</a> <a href="https://github.com/rubberduck-ai/rubberduck-vscode/commits?author=lgrammel" title="Documentation">📖</a> <a href="https://github.com/rubberduck-ai/rubberduck-vscode/pulls?q=is%3Apr+reviewed-by%3Algrammel" title="Reviewed Pull Requests">👀</a> <a href="#question-lgrammel" title="Answering Questions">💬</a> <a href="https://github.com/rubberduck-ai/rubberduck-vscode/issues?q=author%3Algrammel" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="25%"><a href="http://iainvm.github.io"><img src="https://avatars.githubusercontent.com/u/2806167?v=4?s=100" width="100px;" alt="Iain Majer"/><br /><sub><b>Iain Majer</b></sub></a><br /><a href="https://github.com/rubberduck-ai/rubberduck-vscode/issues?q=author%3Aiainvm" title="Bug reports">🐛</a> <a href="https://github.com/rubberduck-ai/rubberduck-vscode/commits?author=iainvm" title="Code">💻</a></td>
      <td align="center" valign="top" width="25%"><a href="https://nicoespeon.com"><img src="https://avatars0.githubusercontent.com/u/1094774?v=4?s=100" width="100px;" alt="Nicolas Carlo"/><br /><sub><b>Nicolas Carlo</b></sub></a><br /><a href="https://github.com/rubberduck-ai/rubberduck-vscode/commits?author=nicoespeon" title="Code">💻</a> <a href="https://github.com/rubberduck-ai/rubberduck-vscode/commits?author=nicoespeon" title="Documentation">📖</a> <a href="https://github.com/rubberduck-ai/rubberduck-vscode/issues?q=author%3Anicoespeon" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="25%"><a href="https://github.com/RatoGBM"><img src="https://avatars.githubusercontent.com/u/80184495?v=4?s=100" width="100px;" alt="RatoGBM"/><br /><sub><b>RatoGBM</b></sub></a><br /><a href="https://github.com/rubberduck-ai/rubberduck-vscode/issues?q=author%3ARatoGBM" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="25%"><a href="https://www.lionelokpeicha.dev/"><img src="https://avatars.githubusercontent.com/u/60504466?v=4?s=100" width="100px;" alt="Lionel Okpeicha"/><br /><sub><b>Lionel Okpeicha</b></sub></a><br /><a href="https://github.com/rubberduck-ai/rubberduck-vscode/issues?q=author%3Alohnsonok" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="25%"><a href="https://github.com/MercerK"><img src="https://avatars.githubusercontent.com/u/13123338?v=4?s=100" width="100px;" alt="MercerK"/><br /><sub><b>MercerK</b></sub></a><br /><a href="https://github.com/rubberduck-ai/rubberduck-vscode/issues?q=author%3AMercerK" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="25%"><a href="https://github.com/lundeen-bryan"><img src="https://avatars.githubusercontent.com/u/13512507?v=4?s=100" width="100px;" alt="Lundeen.Bryan"/><br /><sub><b>Lundeen.Bryan</b></sub></a><br /><a href="#ideas-lundeen-bryan" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="25%"><a href="https://github.com/DucoG"><img src="https://avatars.githubusercontent.com/u/67788719?v=4?s=100" width="100px;" alt="DucoG"/><br /><sub><b>DucoG</b></sub></a><br /><a href="#ideas-DucoG" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="25%"><a href="https://github.com/sbstn87"><img src="https://avatars.githubusercontent.com/u/37237675?v=4?s=100" width="100px;" alt="sbstn87"/><br /><sub><b>sbstn87</b></sub></a><br /><a href="#ideas-sbstn87" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="25%"><a href="https://dev.page/tennox"><img src="https://avatars.githubusercontent.com/u/2084639?v=4?s=100" width="100px;" alt="Manuel"/><br /><sub><b>Manuel</b></sub></a><br /><a href="#ideas-tennox" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Running it locally & Contributing

### [Contributing Guide][contributing]

Read our [contributing guide][contributing] to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

### [Good First Issues][good-first-issues]

To help you get your feet wet and become familiar with our contribution process, we have a list of [good first issues][good-first-issues] that contains things with a relatively limited scope. This is a great place to get started!

<!-- Links -->

[contributing]: https://github.com/rubberduck-ai/rubberduck-vscode/blob/main/CONTRIBUTING.md
[good-first-issues]: https://github.com/rubberduck-ai/rubberduck-vscode/labels/good%20first%20issue
