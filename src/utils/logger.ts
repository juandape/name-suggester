import fs from 'fs';
import path from 'path';
import { SuggestionLogEntry } from '../types/index.js';

/**
 * Logs suggestions to a file
 * @param entry The suggestion log entry to record
 */
export function logSuggestions(entry: SuggestionLogEntry): void {
  // Always try to write to the current working directory first
  const logFile = path.resolve(process.cwd(), 'namer-suggester.log');

  const logContent = formatLogEntry(entry);

  try {
    ensureLogFileExists(logFile);
    fs.appendFileSync(logFile, logContent, 'utf-8');
    console.log(`💾 Log saved at: ${logFile}`);
  } catch (error) {
    console.error(
      `❌ Could not write to ${logFile}: ${(error as Error).message}`
    );
    console.log(
      '💡 Make sure you have write permissions in the project directory'
    );
    console.log(
      `📝 Summary: "${entry.item.name}" -> ${entry.suggestions.join(', ')}`
    );
  }
}

/**
 * Ensures log file exists with proper header
 * @param logFile Path to log file
 */
function ensureLogFileExists(logFile: string): void {
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(
      logFile,
      '# Name Suggestions Log\n\n',
      'utf-8'
    );
  }
}

/**
 * Formats a log entry for writing to file
 * @param entry The log entry to format
 * @returns Formatted string
 */
function formatLogEntry(entry: SuggestionLogEntry): string {
  return `
## ${entry.timestamp} - ${path.basename(entry.filePath)}
- **File**: \`${entry.filePath}\`
- **Type**: ${entry.item.type}
- **Line**: ${entry.item.line || 'N/A'}
- **Original Name**: \`${entry.item.name}\`
- **Context**: ${entry.fileContext.context || 'general'}
- **Suggestions**: ${entry.suggestions.map((s) => `\`${s}\``).join(', ')}
- **Selected**: \`${entry.selected}\`

`;
}
