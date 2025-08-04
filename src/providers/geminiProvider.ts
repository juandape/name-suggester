import fetch from 'node-fetch';
import { BaseAIProvider } from './baseAIProvider.js';
import { AIProviderResponse, PromptContext, AIConfig } from '../types/index.js';

/**
 * Google Gemini provider
 */
export class GeminiProvider extends BaseAIProvider {
  private readonly config: AIConfig['gemini'];

  constructor(config: AIConfig['gemini']) {
    super('Google Gemini');
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
      const model = this.config.model || 'gemini-pro';
      const prompt = this.buildPrompt(context);
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as any;

      if (data.candidates?.[0]?.content) {
        const suggestions = this.processSuggestions(
          data.candidates[0].content.parts[0].text,
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
