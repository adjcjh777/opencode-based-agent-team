export type LLMRole = 'system' | 'user' | 'assistant';

export interface LLMMessage {
  role: LLMRole;
  content: string;
}

export interface LLMStreamChunk {
  text: string;
}

export interface RightCodesProviderConfig {
  type: 'right-codes';
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
}

export interface LLMConfig {
  provider: RightCodesProviderConfig;
  models: {
    primary: string;
    fast: string;
    reasoning: string;
  };
}
