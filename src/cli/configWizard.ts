import inquirer from 'inquirer';
import { AIConfig } from '../types/index.js';

/**
 * AI configuration setup wizard
 */
export class ConfigWizard {
  /**
   * Creates AI configuration through interactive prompts
   * @returns New AI configuration
   */
  public static async createAIConfig(): Promise<AIConfig> {
    const { provider } = await this.selectProvider();
    const config = this.createBaseConfig();

    config.provider = provider;

    if (provider !== 'auto' && provider !== 'rules' && provider !== 'copilot') {
      await this.configureProvider(provider, config);
    }

    return config;
  }

  private static async selectProvider() {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: '🤖 ¿Qué proveedor de IA deseas utilizar?',
        choices: [
          { name: 'Automático (probar todos los disponibles)', value: 'auto' },
          { name: 'GitHub Copilot CLI', value: 'copilot' },
          { name: 'OpenAI (GPT)', value: 'openai' },
          { name: 'Anthropic Claude', value: 'anthropic' },
          { name: 'Ollama (modelos locales)', value: 'ollama' },
          { name: 'Google Gemini', value: 'gemini' },
          { name: 'Solo reglas predefinidas (sin IA)', value: 'rules' },
        ],
      },
    ]);
  }

  private static createBaseConfig(): AIConfig {
    return {
      provider: 'rules',
      openai: { apiKey: '', model: 'gpt-3.5-turbo' },
      anthropic: { apiKey: '', model: 'claude-instant-1' },
      ollama: {
        endpoint: 'http://localhost:11434/api/generate',
        model: 'llama2',
      },
      gemini: { apiKey: '', model: 'gemini-pro' },
    };
  }

  private static async configureProvider(
    provider: string,
    config: AIConfig
  ): Promise<void> {
    switch (provider) {
      case 'openai':
        await this.configureOpenAI(config);
        break;
      case 'anthropic':
        await this.configureAnthropic(config);
        break;
      case 'ollama':
        await this.configureOllama(config);
        break;
      case 'gemini':
        await this.configureGemini(config);
        break;
    }
  }

  private static async configureOpenAI(config: AIConfig): Promise<void> {
    const { apiKey, model } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: '🔑 Introduce tu API key de OpenAI:',
        mask: '*',
      },
      {
        type: 'list',
        name: 'model',
        message: '📊 Selecciona el modelo de OpenAI:',
        choices: [
          { name: 'GPT-3.5 Turbo (más rápido)', value: 'gpt-3.5-turbo' },
          { name: 'GPT-4 (más potente)', value: 'gpt-4' },
          { name: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
        ],
      },
    ]);

    if (config.openai) {
      config.openai.apiKey = apiKey;
      config.openai.model = model;
    }
  }

  private static async configureAnthropic(config: AIConfig): Promise<void> {
    const { apiKey, model } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: '🔑 Introduce tu API key de Anthropic:',
        mask: '*',
      },
      {
        type: 'list',
        name: 'model',
        message: '📊 Selecciona el modelo de Anthropic:',
        choices: [
          { name: 'Claude Instant (más rápido)', value: 'claude-instant-1' },
          { name: 'Claude 2', value: 'claude-2' },
          {
            name: 'Claude 3 Opus (más potente)',
            value: 'claude-3-opus-20240229',
          },
        ],
      },
    ]);

    if (config.anthropic) {
      config.anthropic.apiKey = apiKey;
      config.anthropic.model = model;
    }
  }

  private static async configureOllama(config: AIConfig): Promise<void> {
    const { endpoint, model } = await inquirer.prompt([
      {
        type: 'input',
        name: 'endpoint',
        message: '🌐 URL del endpoint de Ollama:',
        default: 'http://localhost:11434/api/generate',
      },
      {
        type: 'input',
        name: 'model',
        message:
          '📊 Nombre del modelo de Ollama (ej: llama2, codellama, mistral):',
        default: 'llama2',
      },
    ]);

    if (config.ollama) {
      config.ollama.endpoint = endpoint;
      config.ollama.model = model;
    }
  }

  private static async configureGemini(config: AIConfig): Promise<void> {
    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: '🔑 Introduce tu API key de Google Gemini:',
        mask: '*',
      },
    ]);

    if (config.gemini) {
      config.gemini.apiKey = apiKey;
    }
  }
}
