import fetch from 'node-fetch';
import { BaseAIProvider } from './baseAIProvider.js';
import { AIProviderResponse, PromptContext, AIConfig } from '../types/index.js';

/**
 * Anthropic Claude provider
 */
export class AnthropicProvider extends BaseAIProvider {
  private readonly config: AIConfig['anthropic'];

  constructor(config: AIConfig['anthropic']) {
    super('Anthropic Claude');
    this.config = config;
  }

  public async isAvailable(): Promise<boolean> {
    return Boolean(this.config?.apiKey);
  }

  public async getSuggestions(
    context: PromptContext
  ): Promise<AIProviderResponse> {
    if (!this.config?.apiKey) {
      return { suggestions: [] };
    }

    try {
      const model = this.config.model || 'claude-instant-1';
      const prompt = this.buildPrompt(context);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 50,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as any;

      if (data.content?.[0]?.text) {
        const suggestions = this.processSuggestions(
          data.content[0].text,
          context.original
        );

        return {
          suggestions,
          provider: this.name,
        };
      }

      return { suggestions: [] };
    } catch (error) {
      this.handleError(error as Error);
      return { suggestions: [] };
    }
  }
}
