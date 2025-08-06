import fs from 'fs';
import path from 'path';
import os from 'os';
import { AIConfig } from '../types/index.js';

/**
 * Configuration manager for AI providers and other settings
 */
export class ConfigManager {
  private static readonly CONFIG_PATHS = [
    path.join(process.cwd(), '.ai-config.json'),
    path.join(os.homedir(), '.namer-suggester-ai-config.json'),
  ];

  private static readonly DEFAULT_CONFIG: AIConfig = {
    provider: 'rules',
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-3.5-turbo',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: 'claude-instant-1',
    },
    ollama: {
      endpoint: 'http://localhost:11434/api/generate',
      model: 'llama2',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-pro',
    },
  };

  /**
   * Loads AI configuration from available sources
   * @returns AI configuration object
   */
  public static loadAIConfig(): AIConfig {
    for (const configPath of this.CONFIG_PATHS) {
      try {
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          return { ...this.DEFAULT_CONFIG, ...config };
        }
      } catch (error) {
        console.debug(
          `Error loading config from ${configPath}: ${(error as Error).message}`
        );
      }
    }

    return this.DEFAULT_CONFIG;
  }

  /**
   * Saves AI configuration to file
   * @param config Configuration to save
   * @param location Where to save the config
   */
  public static saveAIConfig(
    config: AIConfig,
    location: 'project' | 'global' = 'project'
  ): void {
    const configPath =
      location === 'project' ? this.CONFIG_PATHS[0] : this.CONFIG_PATHS[1];

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
      console.log(`✅ Configuration saved to ${configPath}`);
    } catch (error) {
      throw new Error(
        `Error saving config to ${configPath}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Detects the type of project based on configuration files
   * @returns Project information
   */
  public static detectProjectType(): {
    projectType: string;
    framework: string;
  } {
    try {
      const projectRoot = process.cwd();
      let projectType = 'javascript';
      let framework = 'unknown';

      // Check for TypeScript
      if (fs.existsSync(path.join(projectRoot, 'tsconfig.json'))) {
        projectType = 'typescript';
      }

      // Check for frameworks
      if (
        fs.existsSync(path.join(projectRoot, 'next.config.js')) ||
        fs.existsSync(path.join(projectRoot, 'next.config.mjs'))
      ) {
        framework = 'nextjs';
      } else if (
        fs.existsSync(path.join(projectRoot, 'vite.config.js')) ||
        fs.existsSync(path.join(projectRoot, 'vite.config.ts'))
      ) {
        framework = 'vite';
      } else if (fs.existsSync(path.join(projectRoot, 'angular.json'))) {
        framework = 'angular';
      } else if (
        fs.existsSync(path.join(projectRoot, 'app.json')) &&
        fs.existsSync(path.join(projectRoot, 'metro.config.js'))
      ) {
        framework = 'react-native';
      }

      return { projectType, framework };
    } catch (error) {
      console.debug(
        'Could not determine the project type:',
        (error as Error).message
      );
      return { projectType: 'unknown', framework: 'unknown' };
    }
  }
}
