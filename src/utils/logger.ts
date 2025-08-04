import fs from 'fs';
import path from 'path';
import os from 'os';
import { SuggestionLogEntry } from '../types/index.js';

/**
 * Logs suggestions to a file
 * @param entry The suggestion log entry to record
 */
export function logSuggestions(entry: SuggestionLogEntry): void {
  const possibleLogPaths = [
    path.resolve(process.cwd(), 'namer-suggester.log'),
    path.resolve(os.homedir(), 'namer-suggester.log'),
  ];

  const logContent = formatLogEntry(entry);
  let logSuccess = false;

  for (const logFile of possibleLogPaths) {
    try {
      ensureLogFileExists(logFile);
      fs.appendFileSync(logFile, logContent, 'utf-8');
      console.log(`💾 Registro guardado en: ${logFile}`);
      logSuccess = true;
      break;
    } catch (error) {
      console.debug(
        `No se pudo escribir en ${logFile}: ${(error as Error).message}`
      );
      continue;
    }
  }

  if (!logSuccess) {
    console.error('❌ No se pudo guardar el registro en ninguna ubicación.');
    console.log(
      `📝 Resumen: "${entry.item.name}" -> ${entry.suggestions.join(', ')}`
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
      '# Registro de Sugerencias de Nombres\n\n',
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
- **Archivo**: \`${entry.filePath}\`
- **Tipo**: ${entry.item.type}
- **Línea**: ${entry.item.line || 'N/A'}
- **Nombre Original**: \`${entry.item.name}\`
- **Contexto**: ${entry.fileContext.context || 'general'}
- **Sugerencias**: ${entry.suggestions.map((s) => `\`${s}\``).join(', ')}
- **Seleccionado**: \`${entry.selected}\`

`;
}
