import { execSync } from 'child_process';
import { BaseAIProvider } from './baseAIProvider.js';
import { AIProviderResponse, PromptContext } from '../types/index.js';

/**
 * GitHub Copilot CLI provider
 */
export class CopilotProvider extends BaseAIProvider {
  constructor() {
    super('GitHub Copilot CLI');
  }

  public async isAvailable(): Promise<boolean> {
    try {
      execSync('gh copilot --version', { timeout: 5000, stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  public async getSuggestions(
    context: PromptContext
  ): Promise<AIProviderResponse> {
    try {
      const prompt = this.buildSimplePrompt(context);
      const result = execSync(`echo "${prompt}" | gh copilot suggest`, {
        timeout: 8000,
        encoding: 'utf-8',
      });

      const suggestions = this.processSuggestions(
        result.toString().trim(),
        context.original
      );

      return {
        suggestions,
        provider: this.name,
      };
    } catch (error) {
      this.handleError(error as Error);
      return { suggestions: [] };
    }
  }

  private buildSimplePrompt(context: PromptContext): string {
    return `Sugiere 3 nombres mejores para ${context.type} llamado "${
      context.original
    }" en un archivo ${
      context.fileContext.context || 'JavaScript/TypeScript'
    }. Contexto: ${
      context.context || 'No disponible'
    }. Responde solo con los nombres separados por comas, sin explicaciones adicionales.`;
  }
}
