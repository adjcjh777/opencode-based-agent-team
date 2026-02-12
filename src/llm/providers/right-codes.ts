export interface RightCodesInputConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
}

export interface RightCodesResolvedConfig {
  apiKey: string;
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
