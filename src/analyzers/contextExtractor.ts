import { FileContext } from '../types/index.js';

/**
 * Extracts context information from code content
 */
export class ContextExtractor {
  /**
   * Extracts file context from code content
   * @param code The code content to analyze
   * @returns File context information
   */
  public static extractFileContext(code: string): FileContext {
    const headerComments = this.extractHeaderComments(code);
    const imports = this.extractImports(code);
    const context = this.determineContext(code, imports);

    return {
      context,
      imports,
      headerComments: headerComments.join(' '),
    };
  }

  private static extractHeaderComments(code: string): string[] {
    const headerCommentMatch = /^(\/\/.*|\/\*[\s\S]*?\*\/)\s*$/m.exec(code);
    return headerCommentMatch ? [headerCommentMatch[0]] : [];
  }

  private static extractImports(code: string): string[] {
    const importMatches = [
      ...code.matchAll(/import\s+.*?\s+from\s+['"](.+?)['"]/g),
    ];
    return importMatches.map((match) => match[1]);
  }

  private static determineContext(code: string, imports: string[]): string {
    // Check for React components
    if (this.isReactComponent(code)) {
      return 'react-component';
    }

    // Check for React hooks
    if (this.hasReactHooks(code)) {
      return 'react-hooks';
    }

    // Check for testing
    if (this.isTestFile(code)) {
      return 'testing';
    }

    // Check for API/network code
    if (this.isApiCode(code)) {
      return 'api';
    }

    return 'general';
  }

  private static isReactComponent(code: string): boolean {
    return (
      /function\s+[A-Z][a-zA-Z]*\s*\(/g.test(code) ||
      /const\s+[A-Z][a-zA-Z]*\s*=\s*\(?/g.test(code)
    );
  }

  private static hasReactHooks(code: string): boolean {
    return (
      code.includes('useState') ||
      code.includes('useEffect') ||
      code.includes('useContext') ||
      code.includes('useReducer')
    );
  }

  private static isTestFile(code: string): boolean {
    return code.includes('test(') || code.includes('describe(');
  }

  private static isApiCode(code: string): boolean {
    return (
      code.includes('api') || code.includes('fetch') || code.includes('axios')
    );
  }
}
