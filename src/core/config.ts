import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';

const providerSchema = z
  .object({
    type: z.literal('right-codes'),
    apiKey: z.string().optional(),
    baseUrl: z.string().optional(),
    defaultModel: z.string().optional()
  })
  .strict();

const configSchema = z
  .object({
    provider: providerSchema,
    models: z
      .object({
        primary: z.string(),
        fast: z.string(),
        reasoning: z.string()
      })
      .strict()
  })
  .strict();

export type CodexConfig = z.infer<typeof configSchema>;

export interface LoadConfigOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

function normalizeEnvValue(value: string | undefined): string | undefined {
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

function applyRightCodesEnvFallback(
  config: CodexConfig,
  env: NodeJS.ProcessEnv
): CodexConfig {
  const apiKey = normalizeEnvValue(config.provider.apiKey) ?? normalizeEnvValue(env.RC_API_KEY);
  const baseUrl = normalizeEnvValue(config.provider.baseUrl) ?? normalizeEnvValue(env.RC_BASE_URL);

  if (!apiKey || !baseUrl) {
    throw new Error('Missing right.codes credentials: set RC_API_KEY and RC_BASE_URL.');
  }

  return {
    ...config,
    provider: {
      ...config.provider,
      apiKey,
      baseUrl
    }
  };
}

export async function loadConfig(options: LoadConfigOptions = {}): Promise<CodexConfig> {
  const env = options.env ?? process.env;
  const explorer = cosmiconfig('codex', {
    searchPlaces: ['codex.config.json']
  });
  const result = await explorer.search(options.cwd);

  if (!result) {
    throw new Error(
      'Cannot find codex.config.json. Create one in the project root or provide configuration.'
    );
  }

  const parsed = configSchema.parse(result.config);
  return applyRightCodesEnvFallback(parsed, env);
}
