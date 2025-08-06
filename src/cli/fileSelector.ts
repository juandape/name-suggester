import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { NavigationItem } from '../types/index.js';
import { findFilesByPattern } from '../utils/index.js';

/**
 * File and folder selection service for CLI
 */
export class FileSelector {
  private static readonly ROOT_DIRS = ['./apps', './packages', './src'];

  /**
   * Selects a file or folder interactively
   * @param startDir Starting directory
   * @returns Selected path
   */
  public static async selectFileOrFolder(
    startDir: string = '.'
  ): Promise<string> {
    let currentDir = startDir;

    // Start with root folders if at top level
    if (startDir === '.') {
      const { selection } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selection',
          message: '📂 Select a root folder to start:',
          choices: [
            ...this.ROOT_DIRS.filter((dir) => fs.existsSync(dir)).map(
              (dir) => ({ name: `📁 ${dir}`, value: dir })
            ),
            { name: '🔍 Search file by pattern', value: 'search' },
            { name: '📋 Specify path manually', value: 'manual' },
          ],
        },
      ]);

      if (selection === 'search') {
        return this.searchFileByPattern();
      }

      if (selection === 'manual') {
        return this.getManualPath();
      }

      currentDir = selection;
    }

    return this.navigateFileSystem(currentDir);
  }

  private static async navigateFileSystem(startDir: string): Promise<string> {
    let currentDir = startDir;

    while (true) {
      const items = this.getDirectoryItems(currentDir);
      const choices = this.buildNavigationChoices(currentDir, items);

      const { selection } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selection',
          message: `📂 Navigating: ${currentDir}\nSelect a file or folder:`,
          pageSize: 15,
          choices,
        },
      ]);

      const result = this.handleSelection(selection, currentDir);
      if (result.action === 'navigate') {
        currentDir = result.path;
      } else if (result.action === 'select') {
        return result.path;
      } else if (result.action === 'restart') {
        return this.selectFileOrFolder();
      }
    }
  }

  private static getDirectoryItems(currentDir: string): {
    dirs: NavigationItem[];
    files: NavigationItem[];
  } {
    try {
      const items = fs.readdirSync(currentDir);

      const dirs = items
        .filter((item) =>
          fs.statSync(path.join(currentDir, item)).isDirectory()
        )
        .map((item) => ({
          name: `📁 ${item}/`,
          value: path.join(currentDir, item),
          isDir: true,
        }));

      const files = items
        .filter((item) => {
          const fullPath = path.join(currentDir, item);
          return (
            fs.statSync(fullPath).isFile() && /\.(js|jsx|ts|tsx)$/.test(item)
          );
        })
        .map((item) => ({
          name: `📄 ${item}`,
          value: path.join(currentDir, item),
          isDir: false,
        }));

      return { dirs, files };
    } catch (error) {
      console.error(
        `Error reading directory ${currentDir}:`,
        (error as Error).message
      );
      return { dirs: [], files: [] };
    }
  }

  private static buildNavigationChoices(
    currentDir: string,
    items: { dirs: NavigationItem[]; files: NavigationItem[] }
  ) {
    const navOptions: NavigationItem[] = [
      { name: '⬅️ Go back to previous directory', value: 'back', isDir: true },
      { name: '🏠 Go back to home', value: 'home', isDir: true },
      {
        name: '✅ Select this entire directory',
        value: currentDir,
        isDir: true,
      },
    ];

    if (currentDir !== '.' && path.dirname(currentDir) !== currentDir) {
      navOptions.unshift({
        name: `📁 ${path.dirname(currentDir)}/`,
        value: path.dirname(currentDir),
        isDir: true,
      });
    }

    return [
      ...navOptions,
      new inquirer.Separator('---- Directories ----'),
      ...items.dirs,
      new inquirer.Separator('---- Files ----'),
      ...items.files,
    ];
  }

  private static handleSelection(
    selection: string,
    currentDir: string
  ): { action: string; path: string } {
    if (selection === 'back') {
      if (
        currentDir === '.' ||
        currentDir === '/' ||
        this.ROOT_DIRS.includes(currentDir)
      ) {
        return { action: 'restart', path: '' };
      }
      return { action: 'navigate', path: path.dirname(currentDir) };
    }

    if (selection === 'home') {
      return { action: 'restart', path: '' };
    }

    if (selection === currentDir) {
      console.log(`\n✅ Selected entire directory: ${currentDir}`);
      return { action: 'select', path: selection };
    }

    // Check if it's a directory or file
    try {
      const stat = fs.statSync(selection);
      if (stat.isDirectory()) {
        return { action: 'navigate', path: selection };
      } else {
        return { action: 'select', path: selection };
      }
    } catch {
      return { action: 'select', path: selection };
    }
  }

  private static async searchFileByPattern(): Promise<string> {
    const { pattern } = await inquirer.prompt([
      {
        type: 'input',
        name: 'pattern',
        message:
          '🔍 Enter a pattern to search for files (e.g.: "*.component.ts", "user*.ts"):',
      },
    ]);

    const results: string[] = [];
    for (const rootDir of this.ROOT_DIRS) {
      if (fs.existsSync(rootDir)) {
        findFilesByPattern(rootDir, pattern, results);
      }
    }

    if (results.length === 0) {
      console.log('❌ No files matching the pattern were found.');
      return this.selectFileOrFolder();
    }

    const { selectedFile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFile',
        message: `📑 ${results.length} files found. Select one:`,
        pageSize: 15,
        choices: results.map((file) => ({ name: file, value: file })),
      },
    ]);

    return selectedFile;
  }

  private static async getManualPath(): Promise<string> {
    const { customPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customPath',
        message:
          '📝 Enter the file or folder path (relative to the project):',
      },
    ]);

    if (fs.existsSync(customPath)) {
      return customPath;
    } else {
      console.log('❌ Path not found. Returning to main menu...');
      return this.selectFileOrFolder();
    }
  }
}
