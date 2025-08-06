import { FileContext, AIConfig, PromptContext } from '../types/index.js';
import { RuleBasedSuggester } from './ruleBasedSuggester.js';
import {
  BaseAIProvider,
  CopilotProvider,
  OpenAIProvider,
  AnthropicProvider,
  OllamaProvider,
  GeminiProvider,
} from '../providers/index.js';

/**
 * Main service that orchestrates rule-based and AI-based suggestions
 */
export class SuggestionService {
  private readonly aiConfig: AIConfig;
  private readonly providers: Map<string, BaseAIProvider>;

  constructor(aiConfig: AIConfig) {
    this.aiConfig = aiConfig;
    this.providers = new Map();
    this.initializeProviders();
  }

  /**
   * Gets suggestions for an identifier combining rules and AI
   * @param original Original identifier name
   * @param type Type of identifier
   * @param context Context information
   * @param fileContext File context
   * @returns Combined suggestions
   */
  public async getSuggestions(
    original: string,
    type: string,
    context: string,
    fileContext: Partial<FileContext>
  ): Promise<string[]> {
    // Get rule-based suggestions first
    const ruleSuggestions = RuleBasedSuggester.suggestNames(
      original,
      type,
      context,
      fileContext
    );

    console.log(
      `⚙️ Predefined rules generated ${ruleSuggestions.length} suggestions`
    );

    // Get AI suggestions if enabled
    let aiSuggestions: string[] = [];
    if (this.aiConfig.provider !== 'rules') {
      aiSuggestions = await this.getAISuggestions(
        original,
        type,
        context,
        fileContext
      );
      console.log(
        `🤖 AI generated ${aiSuggestions.length} additional suggestions`
      );
    }

    // Combine and deduplicate suggestions
    const allSuggestions = [...new Set([...ruleSuggestions, ...aiSuggestions])];

    // Ensure we have some suggestions
    if (allSuggestions.length === 0) {
      console.log(
        `⚠️ No suggestions found for ${type} "${original}", generating basic suggestions...`
      );
      return this.generateFallbackSuggestions(original, type);
    }

    return allSuggestions;
  }

  private async getAISuggestions(
    original: string,
    type: string,
    context: string,
    fileContext: Partial<FileContext>
  ): Promise<string[]> {
    const promptContext: PromptContext = {
      original,
      type,
      context,
      fileContext,
    };

    // Try providers based on configuration
    if (this.aiConfig.provider === 'auto') {
      return this.tryAllProviders(promptContext);
    } else {
      return this.trySingleProvider(promptContext, this.aiConfig.provider);
    }
  }

  private async tryAllProviders(context: PromptContext): Promise<string[]> {
    const providerOrder = [
      'copilot',
      'openai',
      'anthropic',
      'gemini',
      'ollama',
    ];

    for (const providerName of providerOrder) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      try {
        if (await provider.isAvailable()) {
          console.log(
            `🔄 Trying to get suggestions from ${provider.constructor.name}...`
          );
          const response = await provider.getSuggestions(context);

          if (response.suggestions.length > 0) {
            console.log(
              `✨ Suggestions obtained from ${response.provider || providerName}`
            );
            return response.suggestions;
          }
        }
      } catch (error) {
        console.debug(
          `Provider ${providerName} failed: ${(error as Error).message}`
        );
      }
    }

    console.log(
      'Info: No AI service available, using only predefined rules.'
    );
    return [];
  }

  private async trySingleProvider(
    context: PromptContext,
    providerName: string
  ): Promise<string[]> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      console.log(`⚠️ Provider ${providerName} not configured`);
      return [];
    }

    try {
      if (await provider.isAvailable()) {
        console.log(
          `🔄 Trying to get suggestions from ${provider.constructor.name}...`
        );
        const response = await provider.getSuggestions(context);

        if (response.suggestions.length > 0) {
          console.log(
            `✨ Suggestions obtained from ${response.provider || providerName}`
          );
          return response.suggestions;
        }
      } else {
        console.log(`⚠️ Provider ${providerName} not available`);
      }
    } catch (error) {
      console.log(`❌ Error with ${providerName}: ${(error as Error).message}`);
    }

    return [];
  }

  private generateFallbackSuggestions(
    original: string,
    type: string
  ): string[] {
    const suggestions: string[] = [];
    const isFunction = type.includes('function') || type === 'method';

    if (isFunction) {
      suggestions.push(`process${this.capitalize(original)}`);
      suggestions.push(`handle${this.capitalize(original)}`);

      if (
        original.includes('click') ||
        original.includes('change') ||
        original.includes('submit')
      ) {
        suggestions.push(`on${this.capitalize(original)}`);
      }

      if (original.startsWith('get')) {
        suggestions.push(original.replace(/^get/, 'fetch'));
        suggestions.push(original.replace(/^get/, 'retrieve'));
      }
    } else {
      suggestions.push(`${original}Value`);
      suggestions.push(`${original}Data`);

      if (original.length <= 3) {
        suggestions.push(`${original}Item`);
        suggestions.push(`${original}Element`);
      }
    }

    // Fallback of last resort
    if (suggestions.length === 0) {
      suggestions.push(`improved${this.capitalize(original)}`);
      suggestions.push(`better${this.capitalize(original)}`);
    }

    return suggestions;
  }

  private initializeProviders(): void {
    this.providers.set('copilot', new CopilotProvider());
    this.providers.set('openai', new OpenAIProvider(this.aiConfig.openai));
    this.providers.set(
      'anthropic',
      new AnthropicProvider(this.aiConfig.anthropic)
    );
    this.providers.set('ollama', new OllamaProvider(this.aiConfig.ollama));
    this.providers.set('gemini', new GeminiProvider(this.aiConfig.gemini));
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
