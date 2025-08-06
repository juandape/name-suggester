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
      `\n🔍 Analyzing ${item.type}: "${item.name}" (line ${
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
          `⚠️ No suggestions found for ${item.type} "${item.name}"`
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

      const selectedLabel = newName === item.name ? 'kept' : 'changed to';
      console.log(`✅ Name ${selectedLabel}: \`${newName}\`\n`);
    } catch (error) {
      console.error(
        `❌ Error getting suggestions for "${item.name}": ${
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
      { name: `${item.name} (keep)`, value: item.name },
      ...suggestions.map((suggestion) => ({
        name: suggestion,
        value: suggestion,
      })),
    ];

    const { newName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'newName',
        message: `💡 Suggestions for ${item.type} "${item.name}" (line ${
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
    console.log('\n📊 Analysis statistics:');
    console.log(`📂 Files analyzed: ${totalFiles}`);
    console.log(`🔍 Identifiers found: ${totalItems}`);
    console.log(
      `✏️ Identifiers with change suggestions: ${changedItems}`
    );
    console.log(
      `📝 A detailed log has been created in 'namer-suggester.log'`
    );
  }

  /**
   * Shows help information
   */
  public static showHelp(): void {
    console.log('\n📚 Namer Suggester Help');
    console.log('=========================');
    console.log(
      'Namer Suggester is a tool that analyzes your JavaScript/TypeScript files'
    );
    console.log(
      'and suggests better names for functions, variables, and other identifiers.'
    );

    console.log('\n🔧 Main options:');
    console.log(
      '1. Analyze files: Select files or directories to analyze.'
    );
    console.log(
      '2. Configure AI: Configure AI providers to get better suggestions.'
    );

    console.log('\n🤖 Supported AI providers:');
    console.log(
      '- GitHub Copilot CLI (requires gh CLI with Copilot extension)'
    );
    console.log('- OpenAI (GPT-3.5/GPT-4, requires API key)');
    console.log('- Anthropic Claude (requires API key)');
    console.log('- Ollama (local models, running on your machine)');
    console.log('- Google Gemini (requires API key)');

    console.log('\n📋 How to use the tool:');
    console.log('1. Select "Analyze files" in the main menu');
    console.log(
      '2. Browse the directory structure or search for files by pattern'
    );
    console.log(
      '3. For each identifier found, review the suggestions and choose the best one'
    );
    console.log(
      '4. All suggestions are saved in namer-suggester.log for future reference'
    );

    console.log('\n⚙️ Configuration file:');
    console.log('AI configuration is saved in:');
    console.log('- .ai-config.json in your current directory');
    console.log(
      '- .namer-suggester-ai-config.json in your user directory'
    );

    console.log('\n🔍 For more information, see the README.md\n');
  }
}
