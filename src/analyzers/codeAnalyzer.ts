import fs from 'fs';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { AnalyzeItem, AnalysisResult } from '../types/index.js';
import { ContextExtractor } from './contextExtractor.js';

// Fix for ES module compatibility with @babel/traverse
const traverseFunction =
  typeof traverse === 'function' ? traverse : (traverse as any).default;

/**
 * Analyzes JavaScript/TypeScript files for identifiers
 */
export class CodeAnalyzer {
  /**
   * Analyzes a file and extracts identifiers
   * @param filePath Path to the file to analyze
   * @returns Analysis results
   */
  public static analyzeFile(filePath: string): AnalysisResult {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const fileContext = ContextExtractor.extractFileContext(code);
      const results = this.parseCodeForIdentifiers(code);

      return { results, fileContext };
    } catch (error) {
      console.error(`Error analizando ${filePath}:`, (error as Error).message);
      return {
        results: [],
        fileContext: { context: 'general', imports: [], headerComments: '' },
      };
    }
  }

  private static parseCodeForIdentifiers(code: string): AnalyzeItem[] {
    try {
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      const results: AnalyzeItem[] = [];

      traverseFunction(ast, {
        FunctionDeclaration: (path) => {
          const name = path.node.id?.name;
          if (name) {
            results.push({
              type: 'function',
              name,
              line: path.node.loc?.start.line,
              context: this.extractComments(path.node.leadingComments),
            });
          }
        },

        VariableDeclarator: (path) => {
          const id = path.node.id;
          const name = id && 'name' in id ? id.name : undefined;
          if (name) {
            const isArrowFunction =
              path.node.init?.type === 'ArrowFunctionExpression';
            const parentContext = this.extractComments(
              path.parentPath?.node?.leadingComments
            );

            results.push({
              type: isArrowFunction ? 'arrow-function' : 'variable',
              name,
              line: path.node.loc?.start.line,
              context: parentContext,
            });
          }
        },

        ClassMethod: (path) => {
          const key = path.node.key;
          const name = key && 'name' in key ? key.name : undefined;
          if (name) {
            results.push({
              type: 'method',
              name,
              line: path.node.loc?.start.line,
              context: this.extractComments(path.node.leadingComments),
            });
          }
        },

        ClassProperty: (path) => {
          const key = path.node.key;
          const name = key && 'name' in key ? key.name : undefined;
          if (name) {
            results.push({
              type: 'property',
              name,
              line: path.node.loc?.start.line,
              context: this.extractComments(path.node.leadingComments),
            });
          }
        },

        ObjectMethod: (path) => {
          const key = path.node.key;
          const name = key && 'name' in key ? key.name : undefined;
          if (name) {
            results.push({
              type: 'object-method',
              name,
              line: path.node.loc?.start.line,
              context: this.extractComments(path.node.leadingComments),
            });
          }
        },
      });

      return results;
    } catch (error) {
      console.error('Error parsing code:', (error as Error).message);
      return [];
    }
  }

  private static extractComments(comments: any[]): string {
    return comments?.map((comment) => comment.value).join('\n') || '';
  }
}
