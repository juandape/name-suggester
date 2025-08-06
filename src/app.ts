#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import { ConfigManager } from './config/index.js';
import { CodeAnalyzer } from './analyzers/index.js';
import { SuggestionService } from './services/index.js';
import {
  FileSelector,
  ConfigWizard,
  SuggestionPresenter,
} from './cli/index.js';
import { walkDirectory, ProgressBar } from './utils/index.js';
import { AnalysisStats } from './types/index.js';

/**
 * Main application class that orchestrates the entire naming suggestion process
 */
export class NamerSuggesterApp {
  private readonly suggestionService: SuggestionService;

  constructor() {
    this.suggestionService = new SuggestionService(
      ConfigManager.loadAIConfig()
    );
  }

  /**
   * Main entry point for the application
   */
  public async run(): Promise<void> {
    this.showWelcome();
    await this.checkDependencies();
    this.showProjectInfo();
    this.showAIConfig();

    const action = await this.showMainMenu();
    await this.handleAction(action);
  }

  private showWelcome(): void {
    console.log('\n🔍 Namer Suggester - Name Analyzer');
    console.log('---------------------------------------');
    console.log(
      'This script analyzes your JavaScript/TypeScript files and suggests better names for functions and variables.\n'
    );
  }

  private async checkDependencies(): Promise<void> {
    try {
      await import('@babel/parser');
      await import('@babel/traverse');
    } catch (depError) {
      console.error('❌ Error: Required dependencies are missing.');
      console.log('🔄 Running dependency installer...');
      console.debug('Dependency error:', (depError as Error).message);

      try {
        execSync(
          'npm install @babel/parser @babel/traverse inquirer node-fetch',
          {
            stdio: 'inherit',
          }
        );
        console.log('✅ Dependencies installed successfully.\n');
      } catch (installError) {
        console.error(
          '❌ Error installing dependencies:',
          (installError as Error).message
        );
        console.log(
          '\n⚠️ Please install the required dependencies manually:'
        );
        console.log(
          'npm install @babel/parser @babel/traverse inquirer node-fetch'
        );
        process.exit(1);
      }
    }
  }

  private showProjectInfo(): void {
    try {
      const projectInfo = ConfigManager.detectProjectType();
      console.log(
        `🧰 Detected project: ${projectInfo.projectType.toUpperCase()}`
      );
      if (projectInfo.framework !== 'unknown') {
        console.log(`🛠️ Framework: ${projectInfo.framework.toUpperCase()}`);
      }
    } catch (projectError) {
      console.log(
        `⚠️ Could not detect project type: ${
          (projectError as Error).message
        }`
      );
      console.log('Continuing with generic analysis...');
    }
  }

  private showAIConfig(): void {
    try {
      const aiConfig = ConfigManager.loadAIConfig();
      const providerDescription = this.getProviderDescription(
        aiConfig.provider
      );
      console.log(`🤖 Suggestion engine: ${providerDescription}\n`);
    } catch (error) {
      console.log(
        '⚠️ Could not load AI configuration. Using predefined rules.\n'
      );
      console.debug('Config error:', (error as Error).message);
    }
  }

  private getProviderDescription(provider: string): string {
    switch (provider) {
      case 'auto':
        return 'Automatic (tries all available)';
      case 'rules':
        return 'Predefined rules (no AI)';
      default:
        return provider.toUpperCase();
    }
  }

  private async showMainMenu(): Promise<string> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '🔧 What do you want to do?',
        choices: [
          {
            name: '📂 Analyze files and get name suggestions',
            value: 'analyze',
          },
          { name: '⚙️ Configure AI providers', value: 'configure-ai' },
          { name: '❓ View help', value: 'help' },
          { name: '❌ Exit', value: 'exit' },
        ],
      },
    ]);

    return action;
  }

  private async handleAction(action: string): Promise<void> {
    switch (action) {
      case 'exit':
        console.log('👋 See you soon!');
        process.exit(0);
        break;
      case 'help':
        SuggestionPresenter.showHelp();
        break;
      case 'configure-ai':
        await this.configureAI();
        break;
      case 'analyze':
        await this.analyzeFiles();
        break;
    }
  }

  private async configureAI(): Promise<void> {
    try {
      const config = await ConfigWizard.createAIConfig();
      const { location } = await this.selectConfigLocation();
      ConfigManager.saveAIConfig(config, location);
      console.log(
        '✅ Configuration completed. Run the program again to analyze files.'
      );
    } catch (error) {
      console.error('❌ Error configuring AI:', (error as Error).message);
    }
  }

  private async selectConfigLocation(): Promise<{
    location: 'project' | 'global';
  }> {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'location',
        message: '📂 Where do you want to save the AI configuration?',
        choices: [
          { name: 'In this project (recommended)', value: 'project' },
          { name: 'In your user directory (global)', value: 'global' },
        ],
      },
    ]);
  }

  private async analyzeFiles(): Promise<void> {
    try {
      const target = await FileSelector.selectFileOrFolder();
      const files = await this.getFilesToAnalyze(target);

      if (files.length === 0) {
        console.log(
          `⚠️ No JavaScript/TypeScript files found in: ${target}`
        );
        return;
      }

      if (files.length > 20) {
        const shouldContinue = await this.confirmLargeAnalysis(files.length);
        if (!shouldContinue) {
          console.log('🛑 Operation cancelled by user.');
          return;
        }
      }

      await this.processFiles(files);
    } catch (error) {
      console.error('❌ Error during analysis:', (error as Error).message);
    }
  }

  private async getFilesToAnalyze(target: string): Promise<string[]> {
    try {
      const stat = fs.statSync(target);
      if (stat.isDirectory()) {
        console.log(`\n📁 Analyzing directory: ${target}`);
        console.log('⏳ Searching for JavaScript/TypeScript files...');
        return walkDirectory(target);
      } else {
        return [target];
      }
    } catch (error) {
      throw new Error(
        `Error accessing ${target}: ${(error as Error).message}`
      );
    }
  }

  private async confirmLargeAnalysis(fileCount: number): Promise<boolean> {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `⚠️ ${fileCount} files found. Do you want to continue with the analysis?`,
        default: true,
      },
    ]);
    return confirm;
  }

  private async processFiles(files: string[]): Promise<void> {
    console.log(`✅ Found ${files.length} files to analyze.\n`);

    const stats: AnalysisStats = {
      totalFiles: files.length,
      totalItems: 0,
      changedItems: 0,
    };

    const progress = new ProgressBar({
      total: files.length,
      prefix: '📊 Analyzing files:',
      suffix: 'Completed',
      length: 20,
    });

    try {
      for (let i = 0; i < files.length; i++) {
        progress.update(i);
        await this.processFile(files[i], stats);
        progress.update(i + 1);
      }
    } finally {
      progress.complete();
    }

    SuggestionPresenter.showStats(
      stats.totalFiles,
      stats.totalItems,
      stats.changedItems
    );
  }

  private async processFile(
    filePath: string,
    stats: AnalysisStats
  ): Promise<void> {
    console.log(`\n📁 Current file: ${path.basename(filePath)}`);

    try {
      const analysisResult = CodeAnalyzer.analyzeFile(filePath);

      if (analysisResult.results.length === 0) {
        console.log(
          '  ℹ️  No identifiers found to analyze in this file.'
        );
        return;
      }

      stats.totalItems += analysisResult.results.length;

      console.log(
        `  🔍 Found ${analysisResult.results.length} identifiers.`
      );
      console.log(
        `  📄 Context: ${analysisResult.fileContext.context || 'general'}`
      );

      if (
        analysisResult.fileContext.imports &&
        analysisResult.fileContext.imports.length > 0
      ) {
        const imports = analysisResult.fileContext.imports
          .slice(0, 3)
          .join(', ');
        const hasMore =
          analysisResult.fileContext.imports.length > 3 ? '...' : '';
        console.log(`  📦 Imports: ${imports}${hasMore}`);
      }

      await SuggestionPresenter.showSuggestionsFor(
        analysisResult.results,
        analysisResult.fileContext,
        filePath,
        (original, type, context, fileContext) =>
          this.suggestionService.getSuggestions(
            original,
            type,
            context,
            fileContext
          )
      );
    } catch (error) {
      console.error(
        `  ❌ Error analyzing ${filePath}: ${(error as Error).message}`
      );
    }
  }
}

/**
 * Entry point when run as a script
 */
export async function main(): Promise<void> {
  try {
    const app = new NamerSuggesterApp();
    await app.run();
  } catch (error) {
    console.error('❌ Fatal error in the application:', (error as Error).message);
    console.error('If this problem persists, please report the error at:');
    console.error('https://github.com/juandape/name-suggester/issues');

    if (process.env.DEBUG) {
      console.error('\nError details (DEBUG):', error);
    } else {
      console.log('\nTo see more error details, run with DEBUG=true');
      console.log('DEBUG=true namer-suggester');
    }

    process.exit(1);
  }
}
