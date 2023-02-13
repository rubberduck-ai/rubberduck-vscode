import * as vscode from "vscode";

const OPEN_AI_API_KEY_SECRET_KEY = "rubberduck.openAI.apiKey";

type UpdateListener = () => void | Promise<void>;
type Unsubscribe = () => void;

export class ApiKeyManager {
  private readonly secretStorage: vscode.SecretStorage;
  private updateListeners = new Map<number, UpdateListener>();

  constructor({ secretStorage }: { secretStorage: vscode.SecretStorage }) {
    this.secretStorage = secretStorage;
  }

  async clearOpenAIApiKey(): Promise<void> {
    await this.secretStorage.delete(OPEN_AI_API_KEY_SECRET_KEY);
    this.updateListeners.forEach((fn) => fn());
  }

  async getOpenAIApiKey(): Promise<string | undefined> {
    return this.secretStorage.get(OPEN_AI_API_KEY_SECRET_KEY);
  }

  async hasOpenAIApiKey(): Promise<boolean> {
    const key = await this.getOpenAIApiKey();
    return key !== undefined;
  }

  onUpdate(fn: UpdateListener): Unsubscribe {
    const key = this.updateListeners.size;
    this.updateListeners.set(key, fn);
    return () => this.updateListeners.delete(key);
  }

  private async storeApiKey(apiKey: string): Promise<void> {
    return this.secretStorage.store(OPEN_AI_API_KEY_SECRET_KEY, apiKey);
  }

  async enterOpenAIApiKey() {
    await this.clearOpenAIApiKey();

    const apiKey = await vscode.window.showInputBox({
      title: "Enter your Open AI API key",
      ignoreFocusOut: true,
      placeHolder: "Open AI API key",
    });

    if (apiKey == null) {
      return; // user aborted input
    }

    await this.storeApiKey(apiKey);

    this.updateListeners.forEach((fn) => fn());
    vscode.window.showInformationMessage("OpenAI API key stored.");
  }
}
