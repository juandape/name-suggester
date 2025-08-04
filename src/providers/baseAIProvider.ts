import { AIProviderResponse, PromptContext } from '../types/index.js';

/**
 * Base class for AI providers
 */
export abstract class BaseAIProvider {
  protected readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Gets suggestions from the AI provider
   * @param context The prompt context
   * @returns AI provider response
   */
  public abstract getSuggestions(
    context: PromptContext
  ): Promise<AIProviderResponse>;

  /**
   * Checks if the provider is available/configured
   * @returns True if available
   */
  public abstract isAvailable(): Promise<boolean>;

  /**
   * Builds a prompt for the AI provider
   * @param context The prompt context
   * @returns Formatted prompt string
   */
  protected buildPrompt(context: PromptContext): string {
    return `Eres un experto en nomenclatura de código para ${
      context.fileContext.context || 'JavaScript/TypeScript'
    }.
Dame 3 a 5 nombres mejores para un${context.type === 'variable' ? 'a' : ''} ${
      context.type
    } llamado "${context.original}"
en un archivo de tipo ${context.fileContext.context || 'JavaScript/TypeScript'}.
Contexto adicional: ${context.context || 'No disponible'}.
Importaciones del archivo: ${
      context.fileContext.imports?.join(', ') || 'No disponibles'
    }.
Responde SOLO con los nombres alternativos separados por comas, sin explicaciones.`;
  }

  /**
   * Processes AI response and extracts valid suggestions
   * @param response Raw response from AI
   * @param original Original identifier name
   * @returns Processed suggestions
   */
  protected processSuggestions(response: string, original: string): string[] {
    return response
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !s.includes(' ') && s !== original && s.length > 0);
  }

  /**
   * Handles provider errors gracefully
   * @param error The error that occurred
   * @param context Additional context for debugging
   */
  protected handleError(error: Error, context?: string): void {
    const contextStr = context ? ` (${context})` : '';
    console.debug(`${this.name} provider error${contextStr}: ${error.message}`);
  }
}
