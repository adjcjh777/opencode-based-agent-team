export interface RightCodesInputConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
}

export interface OpenAICompatInputConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
}

export interface AnthropicInputConfig {
  apiKey?: string;
  defaultModel?: string;
}

export interface GoogleInputConfig {
  apiKey?: string;
  defaultModel?: string;
}

export interface OllamaInputConfig {
  baseUrl?: string;
  defaultModel?: string;
}

export interface RightCodesResolvedConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel?: string;
}

export interface OpenAICompatResolvedConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel?: string;
}

export interface AnthropicResolvedConfig {
  apiKey: string;
  defaultModel?: string;
}

export interface GoogleResolvedConfig {
  apiKey: string;
  defaultModel?: string;
}

export interface OllamaResolvedConfig {
  baseUrl: string;
  defaultModel?: string;
}

function normalize(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed.length) {
    return undefined;
  }

  if (/^\$\{.+\}$/.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function resolveRightCodesConfig(
  config: RightCodesInputConfig,
  env: NodeJS.ProcessEnv = process.env
): RightCodesResolvedConfig {
  const apiKey = normalize(config.apiKey) ?? normalize(env.RC_API_KEY);
  const baseUrl = normalize(config.baseUrl) ?? normalize(env.RC_BASE_URL);

  if (!apiKey || !baseUrl) {
    throw new Error('Missing right.codes credentials: set RC_API_KEY and RC_BASE_URL.');
  }

  return {
    apiKey,
    baseUrl,
    defaultModel: config.defaultModel
  };
}

export function resolveOpenAICompatConfig(
  config: OpenAICompatInputConfig,
  env: NodeJS.ProcessEnv = process.env
): OpenAICompatResolvedConfig {
  const apiKey = normalize(config.apiKey) ?? normalize(env.OPENAI_COMPAT_API_KEY);
  const baseUrl = normalize(config.baseUrl) ?? normalize(env.OPENAI_COMPAT_BASE_URL);

  if (!apiKey || !baseUrl) {
    throw new Error(
      'Missing OpenAI-compatible credentials: set OPENAI_COMPAT_API_KEY and OPENAI_COMPAT_BASE_URL.'
    );
  }

  return {
    apiKey,
    baseUrl,
    defaultModel: config.defaultModel
  };
}

export function resolveAnthropicConfig(
  config: AnthropicInputConfig,
  env: NodeJS.ProcessEnv = process.env
): AnthropicResolvedConfig {
  const apiKey = normalize(config.apiKey) ?? normalize(env.ANTHROPIC_API_KEY);

  if (!apiKey) {
    throw new Error('Missing Anthropic credentials: set ANTHROPIC_API_KEY.');
  }

  return {
    apiKey,
    defaultModel: config.defaultModel
  };
}

export function resolveGoogleConfig(
  config: GoogleInputConfig,
  env: NodeJS.ProcessEnv = process.env
): GoogleResolvedConfig {
  const apiKey = normalize(config.apiKey) ?? normalize(env.GOOGLE_API_KEY);

  if (!apiKey) {
    throw new Error('Missing Google credentials: set GOOGLE_API_KEY.');
  }

  return {
    apiKey,
    defaultModel: config.defaultModel
  };
}

export function resolveOllamaConfig(
  config: OllamaInputConfig,
  env: NodeJS.ProcessEnv = process.env
): OllamaResolvedConfig {
  const baseUrl = normalize(config.baseUrl) ?? normalize(env.OLLAMA_BASE_URL) ?? 'http://localhost:11434/v1';

  return {
    baseUrl,
    defaultModel: config.defaultModel
  };
}
