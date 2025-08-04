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
    console.log('\n🔍 Namer Suggester - Analizador de nombres');
    console.log('---------------------------------------');
    console.log(
      'Este script analiza tus archivos JavaScript/TypeScript y sugiere mejores nombres para funciones y variables.\n'
    );
  }

  private async checkDependencies(): Promise<void> {
    try {
      await import('@babel/parser');
      await import('@babel/traverse');
    } catch (depError) {
      console.error('❌ Error: Faltan dependencias necesarias.');
      console.log('🔄 Ejecutando instalador de dependencias...');
      console.debug('Dependency error:', (depError as Error).message);

      try {
        execSync(
          'npm install @babel/parser @babel/traverse inquirer node-fetch',
          {
            stdio: 'inherit',
          }
        );
        console.log('✅ Dependencias instaladas correctamente.\n');
      } catch (installError) {
        console.error(
          '❌ Error instalando dependencias:',
          (installError as Error).message
        );
        console.log(
          '\n⚠️ Por favor, instala manualmente las dependencias necesarias:'
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
        `🧰 Proyecto detectado: ${projectInfo.projectType.toUpperCase()}`
      );
      if (projectInfo.framework !== 'unknown') {
        console.log(`🛠️ Framework: ${projectInfo.framework.toUpperCase()}`);
      }
    } catch (projectError) {
      console.log(
        `⚠️ No se pudo detectar el tipo de proyecto: ${
          (projectError as Error).message
        }`
      );
      console.log('Continuando con análisis genérico...');
    }
  }

  private showAIConfig(): void {
    try {
      const aiConfig = ConfigManager.loadAIConfig();
      const providerDescription = this.getProviderDescription(
        aiConfig.provider
      );
      console.log(`🤖 Motor de sugerencias: ${providerDescription}\n`);
    } catch (error) {
      console.log(
        '⚠️ No se pudo cargar configuración de IA. Usando reglas predefinidas.\n'
      );
      console.debug('Config error:', (error as Error).message);
    }
  }

  private getProviderDescription(provider: string): string {
    switch (provider) {
      case 'auto':
        return 'Automático (prueba todos los disponibles)';
      case 'rules':
        return 'Reglas predefinidas (sin IA)';
      default:
        return provider.toUpperCase();
    }
  }

  private async showMainMenu(): Promise<string> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '🔧 ¿Qué deseas hacer?',
        choices: [
          {
            name: '📂 Analizar archivos y obtener sugerencias de nombres',
            value: 'analyze',
          },
          { name: '⚙️ Configurar proveedores de IA', value: 'configure-ai' },
          { name: '❓ Ver ayuda', value: 'help' },
          { name: '❌ Salir', value: 'exit' },
        ],
      },
    ]);

    return action;
  }

  private async handleAction(action: string): Promise<void> {
    switch (action) {
      case 'exit':
        console.log('👋 ¡Hasta pronto!');
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
        '✅ Configuración completada. Ejecuta nuevamente el programa para analizar archivos.'
      );
    } catch (error) {
      console.error('❌ Error configurando IA:', (error as Error).message);
    }
  }

  private async selectConfigLocation(): Promise<{
    location: 'project' | 'global';
  }> {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'location',
        message: '📂 ¿Dónde deseas guardar la configuración de IA?',
        choices: [
          { name: 'En este proyecto (recomendado)', value: 'project' },
          { name: 'En tu directorio de usuario (global)', value: 'global' },
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
          `⚠️ No se encontraron archivos JavaScript/TypeScript en: ${target}`
        );
        return;
      }

      if (files.length > 20) {
        const shouldContinue = await this.confirmLargeAnalysis(files.length);
        if (!shouldContinue) {
          console.log('🛑 Operación cancelada por el usuario.');
          return;
        }
      }

      await this.processFiles(files);
    } catch (error) {
      console.error('❌ Error durante el análisis:', (error as Error).message);
    }
  }

  private async getFilesToAnalyze(target: string): Promise<string[]> {
    try {
      const stat = fs.statSync(target);
      if (stat.isDirectory()) {
        console.log(`\n📁 Analizando directorio: ${target}`);
        console.log('⏳ Buscando archivos JavaScript/TypeScript...');
        return walkDirectory(target);
      } else {
        return [target];
      }
    } catch (error) {
      throw new Error(
        `Error accediendo a ${target}: ${(error as Error).message}`
      );
    }
  }

  private async confirmLargeAnalysis(fileCount: number): Promise<boolean> {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `⚠️ Se encontraron ${fileCount} archivos. ¿Deseas continuar con el análisis?`,
        default: true,
      },
    ]);
    return confirm;
  }

  private async processFiles(files: string[]): Promise<void> {
    console.log(`✅ Se encontraron ${files.length} archivos para analizar.\n`);

    const stats: AnalysisStats = {
      totalFiles: files.length,
      totalItems: 0,
      changedItems: 0,
    };

    const progress = new ProgressBar({
      total: files.length,
      prefix: '📊 Analizando archivos:',
      suffix: 'Completado',
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
    console.log(`\n📁 Archivo actual: ${path.basename(filePath)}`);

    try {
      const analysisResult = CodeAnalyzer.analyzeFile(filePath);

      if (analysisResult.results.length === 0) {
        console.log(
          '  ℹ️  No se encontraron identificadores para analizar en este archivo.'
        );
        return;
      }

      stats.totalItems += analysisResult.results.length;

      console.log(
        `  🔍 Se encontraron ${analysisResult.results.length} identificadores.`
      );
      console.log(
        `  📄 Contexto: ${analysisResult.fileContext.context || 'general'}`
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
        console.log(`  📦 Importaciones: ${imports}${hasMore}`);
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
        `  ❌ Error analizando ${filePath}: ${(error as Error).message}`
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
    console.error('❌ Error fatal en la aplicación:', (error as Error).message);
    console.error('Si este problema persiste, por favor reporta el error en:');
    console.error('https://github.com/juandape/name-suggester/issues');

    if (process.env.DEBUG) {
      console.error('\nDetalles del error (DEBUG):', error);
    } else {
      console.log('\nPara ver más detalles del error, ejecuta con DEBUG=true');
      console.log('DEBUG=true namer-suggester');
    }

    process.exit(1);
  }
}
