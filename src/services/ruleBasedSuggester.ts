import { FileContext } from '../types/index.js';

/**
 * Generates naming suggestions based on predefined rules and best practices
 */
export class RuleBasedSuggester {
  /**
   * Generates suggestions for a given identifier
   * @param original Original name
   * @param type Type of identifier
   * @param itemContext Context of the identifier
   * @param fileContext File context information
   * @returns Array of suggestions
   */
  public static suggestNames(
    original: string,
    type: string = '',
    itemContext: string = '',
    fileContext: Partial<FileContext> = {}
  ): string[] {
    const suggestions = new Set<string>();

    // Apply different suggestion strategies
    this.applyFunctionSuggestions(original, type, suggestions);
    this.applyVariableSuggestions(original, type, suggestions);
    this.applyReactSpecificSuggestions(
      original,
      type,
      fileContext,
      suggestions
    );
    this.applyTestingSuggestions(original, type, fileContext, suggestions);
    this.applyGeneralImprovements(original, type, suggestions);

    // Remove original name and convert to array
    suggestions.delete(original);
    return Array.from(suggestions);
  }

  private static applyFunctionSuggestions(
    original: string,
    type: string,
    suggestions: Set<string>
  ): void {
    const isFunction = this.isFunctionType(type);
    if (!isFunction) return;

    this.addEventHandlerSuggestions(original, suggestions);
    this.addAccessorSuggestions(original, suggestions);
    this.addMutatorSuggestions(original, suggestions);
    this.addApiSuggestions(original, suggestions);
    this.addValidationSuggestions(original, suggestions);
    this.addInitializationSuggestions(original, suggestions);
  }

  private static applyVariableSuggestions(
    original: string,
    type: string,
    suggestions: Set<string>
  ): void {
    if (this.isFunctionType(type)) return;

    this.addDataVariableSuggestions(original, suggestions);
    this.addCounterSuggestions(original, suggestions);
    this.addFlagSuggestions(original, suggestions);
    this.addTemporarySuggestions(original, suggestions);
  }

  private static applyReactSpecificSuggestions(
    original: string,
    type: string,
    fileContext: Partial<FileContext>,
    suggestions: Set<string>
  ): void {
    if (!this.isReactContext(fileContext)) return;

    this.addReactComponentSuggestions(original, type, suggestions);
    this.addReactHookSuggestions(original, type, suggestions);
    this.addReactEventHandlerSuggestions(original, type, suggestions);
    this.addReactStateSuggestions(original, type, suggestions);
  }

  private static applyTestingSuggestions(
    original: string,
    type: string,
    fileContext: Partial<FileContext>,
    suggestions: Set<string>
  ): void {
    if (fileContext.context !== 'testing') return;

    if (this.isFunctionType(type) && /test|spec|should/i.test(original)) {
      const baseName = original.replace(/test|spec|should|it/i, '');
      if (baseName) {
        suggestions.add(`should${this.capitalize(baseName)}`);
        suggestions.add(`it${this.capitalize(baseName)}`);
      }
    }
  }

  private static applyGeneralImprovements(
    original: string,
    type: string,
    suggestions: Set<string>
  ): void {
    // Add descriptive suffixes for short names
    if (original.length < 4 && !/^(id|i|j)$/.test(original)) {
      suggestions.add(`${original}Value`);
      suggestions.add(`temp${this.capitalize(original)}`);
    }
  }

  // Helper methods for function suggestions
  private static addEventHandlerSuggestions(
    original: string,
    suggestions: Set<string>
  ): void {
    if (/handle|process|execute/i.test(original)) {
      suggestions.add(original.replace(/handle/i, 'on'));
      suggestions.add(original.replace(/process/i, 'transform'));
      suggestions.add(original.replace(/execute/i, 'run'));

      if (!original.endsWith('Handler')) {
        suggestions.add(original + 'Handler');
      }
    }
  }

  private static addAccessorSuggestions(
    original: string,
    suggestions: Set<string>
  ): void {
    if (original.startsWith('get') && original.length > 5) {
      suggestions.add(original.replace(/^get/, 'retrieve'));
      suggestions.add(original.replace(/^get/, 'fetch'));
    }
  }

  private static addMutatorSuggestions(
    original: string,
    suggestions: Set<string>
  ): void {
    if (original.startsWith('set') && original.length > 5) {
      suggestions.add(original.replace(/^set/, 'update'));
      suggestions.add(original.replace(/^set/, 'modify'));
    }
  }

  private static addApiSuggestions(
    original: string,
    suggestions: Set<string>
  ): void {
    if (/api|fetch|load|request/i.test(original)) {
      const resource = original
        .replace(/fetch|get|load|request|api/gi, '')
        .toLowerCase();
      if (resource) {
        suggestions.add(`fetch${this.capitalize(resource)}`);
        suggestions.add(`load${this.capitalize(resource)}`);
        suggestions.add(`retrieve${this.capitalize(resource)}`);
      } else {
        suggestions.add('fetchData');
        suggestions.add('loadContent');
        suggestions.add('retrieveResources');
      }
    }
  }

  private static addValidationSuggestions(
    original: string,
    suggestions: Set<string>
  ): void {
    if (/check|validate|verify/i.test(original)) {
      suggestions.add(original.replace(/check/i, 'validate'));
      suggestions.add(
        original.replace(/check|validate|verify/i, 'is') + 'Valid'
      );
      suggestions.add(
        original.replace(/check|validate|verify/i, 'ensure') + 'Valid'
      );
    }
  }

  private static addInitializationSuggestions(
    original: string,
    suggestions: Set<string>
  ): void {
    if (/init|start|begin/i.test(original)) {
      suggestions.add(original.replace(/init|start|begin/i, 'initialize'));
      suggestions.add(original.replace(/init|start|begin/i, 'setup'));
      suggestions.add(original.replace(/init|start|begin/i, 'create'));
    }
  }

  // Helper methods for variable suggestions
  private static addDataVariableSuggestions(
    original: string,
    suggestions: Set<string>
  ): void {
    if (/data|info|payload/i.test(original)) {
      suggestions.add('payload');
      suggestions.add('response');
      suggestions.add('result');
      suggestions.add('content');

      if (/s$|list$|array$/i.test(original)) {
        suggestions.add('items');
        suggestions.add('collection');
        suggestions.add('elements');
      }
    }
  }

  private static addCounterSuggestions(
    original: string,
    suggestions: Set<string>
  ): void {
    if (/count|index|num|i$|j$/i.test(original) && original.length < 7) {
      suggestions.add('counter');
      suggestions.add('index');
      suggestions.add('position');
    }
  }

  private static addFlagSuggestions(
    original: string,
    suggestions: Set<string>
  ): void {
    if (/is|has|should|can|flag/i.test(original)) {
      if (!/^(is|has|should|can)/.test(original)) {
        suggestions.add(`is${this.capitalize(original)}`);
        suggestions.add(`has${this.capitalize(original)}`);
      }
    }
  }

  private static addTemporarySuggestions(
    original: string,
    suggestions: Set<string>
  ): void {
    if (original.length < 4 && !/^(id|i|j)$/.test(original)) {
      suggestions.add(`${original}Item`);
      suggestions.add(`current${this.capitalize(original)}`);
    }
  }

  // React-specific suggestions
  private static addReactComponentSuggestions(
    original: string,
    type: string,
    suggestions: Set<string>
  ): void {
    const isComponent = /^[A-Z]/.test(original);
    if (isComponent) {
      if (!/^[A-Z]/.test(original)) {
        suggestions.add(this.capitalize(original));
      }
      if (!original.endsWith('Component') && original.length > 4) {
        suggestions.add(original + 'Component');
      }
    }
  }

  private static addReactHookSuggestions(
    original: string,
    type: string,
    suggestions: Set<string>
  ): void {
    if (this.isFunctionType(type) && !original.startsWith('use')) {
      suggestions.add(`use${this.capitalize(original)}`);
    }
  }

  private static addReactEventHandlerSuggestions(
    original: string,
    type: string,
    suggestions: Set<string>
  ): void {
    if (
      this.isFunctionType(type) &&
      /click|change|submit|input/i.test(original)
    ) {
      if (!original.startsWith('handle')) {
        suggestions.add(`handle${this.capitalize(original)}`);
        suggestions.add(`on${this.capitalize(original)}`);
      }
    }
  }

  private static addReactStateSuggestions(
    original: string,
    type: string,
    suggestions: Set<string>
  ): void {
    if (
      !this.isFunctionType(type) &&
      /state|status|value|data/i.test(original)
    ) {
      const stateName = original.replace(/(state|status|value|data)/i, '');
      if (stateName) {
        suggestions.add(stateName.toLowerCase());
        suggestions.add(`${stateName.toLowerCase()}State`);
      } else {
        suggestions.add('value');
        suggestions.add('state');
        suggestions.add('data');
      }
    }
  }

  // Utility methods
  private static isFunctionType(type: string): boolean {
    const normalizedType = type.toLowerCase();
    return (
      normalizedType.includes('function') ||
      normalizedType === 'method' ||
      normalizedType === 'object-method'
    );
  }

  private static isReactContext(fileContext: Partial<FileContext>): boolean {
    return (
      fileContext.context === 'react-component' ||
      fileContext.context === 'react-hooks'
    );
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
