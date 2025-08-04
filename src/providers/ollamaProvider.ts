import fetch from 'node-fetch';
import { BaseAIProvider } from './baseAIProvider.js';
import { AIProviderResponse, PromptContext, AIConfig } from '../types/index.js';

/**
 * Ollama local model provider
 */
export class OllamaProvider extends BaseAIProvider {
  private readonly config: AIConfig['ollama'];

  constructor(config: AIConfig['ollama']) {
    super('Ollama');
    this.config = config;
  }

  public async isAvailable(): Promise<boolean> {
    if (!this.config?.endpoint) {
      return false;
    }

    try {
      const response = await fetch(
        this.config.endpoint.replace('/generate', '/tags'),
        {
          method: 'GET',
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  public async getSuggestions(
    context: PromptContext
  ): Promise<AIProviderResponse> {
    if (!this.config?.endpoint) {
      return { suggestions: [] };
    }

    try {
      const model = this.config.model || 'llama2';
      const prompt = this.buildPrompt(context);

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as any;

      if (data.response) {
        const suggestions = this.processSuggestions(
          data.response,
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
