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

export interface OpenAICompatibleProviderConfig {
  type: 'openai-compatible';
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
}

export interface AnthropicProviderConfig {
  type: 'anthropic';
  apiKey?: string;
  defaultModel?: string;
}

export interface GoogleProviderConfig {
  type: 'google';
  apiKey?: string;
  defaultModel?: string;
}

export interface OllamaProviderConfig {
  type: 'ollama';
  baseUrl?: string;
  defaultModel?: string;
}

export type ProviderConfig =
  | RightCodesProviderConfig
  | OpenAICompatibleProviderConfig
  | AnthropicProviderConfig
  | GoogleProviderConfig
  | OllamaProviderConfig;

export interface LLMConfig {
  provider: ProviderConfig;
  models: {
    primary: string;
    fast: string;
    reasoning: string;
  };
}
