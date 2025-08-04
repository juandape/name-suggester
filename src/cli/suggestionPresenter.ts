import inquirer from 'inquirer';
import {
  AnalyzeItem,
  FileContext,
  SuggestionLogEntry,
} from '../types/index.js';
import { logSuggestions } from '../utils/index.js';

/**
 * Handles the interactive presentation of suggestions to users
 */
export class SuggestionPresenter {
  /**
   * Shows suggestions for multiple items in a file
   * @param results Analysis results
   * @param fileContext File context
   * @param filePath Path to the file
   * @param getSuggestions Function to get suggestions for an item
   */
  public static async showSuggestionsFor(
    results: AnalyzeItem[],
    fileContext: FileContext,
    filePath: string,
    getSuggestions: (
      original: string,
      type: string,
      context: string,
      fileContext: Partial<FileContext>
    ) => Promise<string[]>
  ): Promise<void> {
    for (const item of results) {
      await this.handleSingleItem(item, fileContext, filePath, getSuggestions);
    }
  }

  private static async handleSingleItem(
    item: AnalyzeItem,
    fileContext: FileContext,
    filePath: string,
    getSuggestions: (
      original: string,
      type: string,
      context: string,
      fileContext: Partial<FileContext>
    ) => Promise<string[]>
  ): Promise<void> {
    console.log(
      `\n🔍 Analizando ${item.type}: "${item.name}" (línea ${
        item.line || 'N/A'
      })`
    );

    try {
      const suggestions = await getSuggestions(
        item.name,
        item.type,
        item.context || '',
        fileContext
      );

      if (suggestions.length === 0) {
        console.log(
          `⚠️ No se encontraron sugerencias para ${item.type} "${item.name}"`
        );
        return;
      }

      const newName = await this.presentSuggestions(item, suggestions);
      await this.recordSelection(
        item,
        suggestions,
        newName,
        fileContext,
        filePath
      );

      const selectedLabel = newName === item.name ? 'mantenido' : 'cambiado a';
      console.log(`✅ Nombre ${selectedLabel}: \`${newName}\`\n`);
    } catch (error) {
      console.error(
        `❌ Error obteniendo sugerencias para "${item.name}": ${
          (error as Error).message
        }`
      );
    }
  }

  private static async presentSuggestions(
    item: AnalyzeItem,
    suggestions: string[]
  ): Promise<string> {
    const choices = [
      { name: `${item.name} (mantener)`, value: item.name },
      ...suggestions.map((suggestion) => ({
        name: suggestion,
        value: suggestion,
      })),
    ];

    const { newName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'newName',
        message: `💡 Sugerencias para ${item.type} "${item.name}" (línea ${
          item.line || 'N/A'
        }):`,
        pageSize: 10,
        choices,
      },
    ]);

    return newName;
  }

  private static async recordSelection(
    item: AnalyzeItem,
    suggestions: string[],
    selected: string,
    fileContext: FileContext,
    filePath: string
  ): Promise<void> {
    const logEntry: SuggestionLogEntry = {
      filePath,
      item,
      suggestions,
      selected,
      fileContext,
      timestamp: new Date().toISOString(),
    };

    logSuggestions(logEntry);
  }

  /**
   * Shows analysis statistics
   * @param totalFiles Total files analyzed
   * @param totalItems Total items found
   * @param changedItems Items that were changed
   */
  public static showStats(
    totalFiles: number,
    totalItems: number,
    changedItems: number
  ): void {
    console.log('\n📊 Estadísticas del análisis:');
    console.log(`📂 Archivos analizados: ${totalFiles}`);
    console.log(`🔍 Identificadores encontrados: ${totalItems}`);
    console.log(
      `✏️ Identificadores con sugerencias de cambio: ${changedItems}`
    );
    console.log(
      `📝 Se ha creado un registro detallado en 'namer-suggester.log'`
    );
  }

  /**
   * Shows help information
   */
  public static showHelp(): void {
    console.log('\n📚 Ayuda de Namer Suggester');
    console.log('=========================');
    console.log(
      'Namer Suggester es una herramienta que analiza tus archivos JavaScript/TypeScript'
    );
    console.log(
      'y sugiere mejores nombres para funciones, variables y otros identificadores.'
    );

    console.log('\n🔧 Opciones principales:');
    console.log(
      '1. Analizar archivos: Selecciona archivos o directorios para analizar.'
    );
    console.log(
      '2. Configurar IA: Configura los proveedores de IA para obtener mejores sugerencias.'
    );

    console.log('\n🤖 Proveedores de IA soportados:');
    console.log(
      '- GitHub Copilot CLI (requiere gh CLI con extensión de Copilot)'
    );
    console.log('- OpenAI (GPT-3.5/GPT-4, requiere API key)');
    console.log('- Anthropic Claude (requiere API key)');
    console.log('- Ollama (modelos locales, ejecutándose en tu máquina)');
    console.log('- Google Gemini (requiere API key)');

    console.log('\n📋 Cómo usar la herramienta:');
    console.log('1. Selecciona "Analizar archivos" en el menú principal');
    console.log(
      '2. Navega por la estructura de directorios o busca archivos por patrón'
    );
    console.log(
      '3. Para cada identificador encontrado, revisa las sugerencias y elige la mejor'
    );
    console.log(
      '4. Todas las sugerencias se guardan en namer-suggester.log para referencia futura'
    );

    console.log('\n⚙️ Archivo de configuración:');
    console.log('La configuración de IA se guarda en:');
    console.log('- .ai-config.json en tu directorio actual');
    console.log(
      '- .namer-suggester-ai-config.json en tu directorio de usuario'
    );

    console.log('\n🔍 Para más información, consulta el README.md\n');
  }
}
