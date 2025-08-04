export interface AIConfig {
  provider:
    | 'auto'
    | 'copilot'
    | 'openai'
    | 'anthropic'
    | 'ollama'
    | 'gemini'
    | 'rules';
  openai?: {
    apiKey: string;
    model: string;
  };
  anthropic?: {
    apiKey: string;
    model: string;
  };
  ollama?: {
    endpoint: string;
    model: string;
  };
  gemini?: {
    apiKey: string;
    model: string;
  };
}

export interface AIProviderResponse {
  suggestions: string[];
  provider?: string;
}

export interface PromptContext {
  original: string;
  type: string;
  context: string;
  fileContext: any;
}
