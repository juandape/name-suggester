import fetch from 'node-fetch';
import { BaseAIProvider } from './baseAIProvider.js';
import { AIProviderResponse, PromptContext, AIConfig } from '../types/index.js';

/**
 * OpenAI GPT provider
 */
export class OpenAIProvider extends BaseAIProvider {
  private readonly config: AIConfig['openai'];

  constructor(config: AIConfig['openai']) {
    super('OpenAI');
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
      const model = this.config.model || 'gpt-3.5-turbo';
      const prompt = this.buildPrompt(context);

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content:
                  'Eres un experto en nomenclatura de código. Responde solo con los nombres sugeridos separados por comas, sin explicaciones.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 50,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as any;

      if (data.error) {
        throw new Error(
          `OpenAI error: ${data.error.message || JSON.stringify(data.error)}`
        );
      }

      if (data.choices?.[0]?.message) {
        const suggestions = this.processSuggestions(
          data.choices[0].message.content,
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
