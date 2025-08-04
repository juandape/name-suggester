export interface FileContext {
  context: string;
  imports: string[];
  headerComments: string;
}

export interface AnalyzeItem {
  type: string;
  name: string;
  line?: number;
  context?: string;
}

export interface SuggestionLogEntry {
  filePath: string;
  item: AnalyzeItem;
  suggestions: string[];
  selected: string;
  fileContext: FileContext;
  timestamp: string;
}

export interface ProjectInfo {
  projectType: string;
  framework: string;
}

export interface AnalysisResult {
  results: AnalyzeItem[];
  fileContext: FileContext;
}

export interface AnalysisStats {
  totalFiles: number;
  totalItems: number;
  changedItems: number;
}
