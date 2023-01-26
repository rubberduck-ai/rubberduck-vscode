import axios from "axios";
import { ApiKeyManager } from "./ApiKeyManager";

export class OpenAIClient {
  private readonly apiKeyManager: ApiKeyManager;

  constructor({ apiKeyManager }: { apiKeyManager: ApiKeyManager }) {
    this.apiKeyManager = apiKeyManager;
  }

  async generateCompletion({
    prompt,
    maxTokens,
    stop,
  }: {
    prompt: string;
    maxTokens: number;
    stop?: string[] | undefined;
  }) {
    const response = await axios.post(
      `https://api.openai.com/v1/completions`,
      {
        model: "text-davinci-003",
        prompt,
        max_tokens: maxTokens,
        stop,
        temperature: 0,
        // top_p is excluded because temperature is set
        best_of: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.apiKeyManager.getOpenAIApiKey()}`,
        },
      }
    );

    return response.data.choices[0].text;
  }
}
