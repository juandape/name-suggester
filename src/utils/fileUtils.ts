import fs from 'fs';
import path from 'path';

/**
 * Walks through a directory recursively and finds files matching the given extension pattern
 * @param dir Directory to walk through
 * @param ext Extension pattern to match
 * @param maxDepth Maximum depth to traverse
 * @param currentDepth Current depth (used internally)
 * @returns Array of file paths
 */
export function walkDirectory(
  dir: string,
  ext: RegExp = /\.(js|jsx|ts|tsx)$/,
  maxDepth: number = 10,
  currentDepth: number = 0
): string[] {
  try {
    if (currentDepth > maxDepth) {
      console.log(`⚠️ Maximum depth reached at: ${dir}`);
      return [];
    }

    const files = fs.readdirSync(dir);
    return files
      .map((f) => path.join(dir, f))
      .flatMap((p) => {
        try {
          const stats = fs.statSync(p);
          if (stats.isDirectory()) {
            return walkDirectory(p, ext, maxDepth, currentDepth + 1);
          }
          if (ext.test(p)) {
            return [p];
          }
          return [];
        } catch (error) {
          console.error(
            `❌ Error accessing: ${p}`,
            (error as Error).message
          );
          return [];
        }
      });
  } catch (error) {
    console.error(
      `❌ Error reading directory: ${dir}`,
      (error as Error).message
    );
    return [];
  }
}

/**
 * Finds files by pattern in given directories
 * @param dir Directory to search in
 * @param pattern Pattern to match
 * @param results Array to store results
 */
export function findFilesByPattern(
  dir: string,
  pattern: string,
  results: string[]
): void {
  try {
    const files = fs.readdirSync(dir);
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        findFilesByPattern(fullPath, pattern, results);
      } else if (regex.test(file)) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.error(
      `❌ Error searching files in: ${dir}`,
      (error as Error).message
    );
  }
}
