import OpenAI from 'openai';
import { BaseAIProvider } from './baseAIProvider.js';
import { AIProviderResponse, PromptContext, AIConfig } from '../types/index.js';

/**
 * OpenAI GPT provider
 */
export class OpenAIProvider extends BaseAIProvider {
  private readonly config: AIConfig['openai'];
  private readonly client: OpenAI;

  constructor(config: AIConfig['openai']) {
    super('OpenAI');
    this.config = config;
    this.client = new OpenAI({
      apiKey: this.config?.apiKey,
    });
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

      const completion = await this.client.chat.completions.create({
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
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return { suggestions: [] };
      }

      const suggestions = this.processSuggestions(content, context.original);
      return {
        suggestions,
        provider: this.name,
      };
    } catch (error) {
      this.handleError(error as Error);
      return { suggestions: [] };
    }
  }
}
