import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';

import {
  resolveAnthropicConfig,
  resolveGoogleConfig,
  resolveOllamaConfig,
  resolveOpenAICompatConfig,
  resolveRightCodesConfig
} from '../llm/providers/right-codes.js';

const providerSchema = z
  .discriminatedUnion('type', [
    z
      .object({
        type: z.literal('right-codes'),
        apiKey: z.string().optional(),
        baseUrl: z.string().optional(),
        defaultModel: z.string().optional()
      })
      .strict(),
    z
      .object({
        type: z.literal('openai-compatible'),
        apiKey: z.string().optional(),
        baseUrl: z.string().optional(),
        defaultModel: z.string().optional()
      })
      .strict(),
    z
      .object({
        type: z.literal('anthropic'),
        apiKey: z.string().optional(),
        defaultModel: z.string().optional()
      })
      .strict(),
    z
      .object({
        type: z.literal('google'),
        apiKey: z.string().optional(),
        defaultModel: z.string().optional()
      })
      .strict(),
    z
      .object({
        type: z.literal('ollama'),
        baseUrl: z.string().optional(),
        defaultModel: z.string().optional()
      })
      .strict()
  ]);

const permissionLevelSchema = z.enum(['allow', 'deny', 'ask']);

const configSchema = z
  .object({
    provider: providerSchema,
    models: z
      .object({
        primary: z.string(),
        fast: z.string(),
        reasoning: z.string()
      })
      .strict(),
    tools: z
      .object({
        permissions: z.record(z.string(), permissionLevelSchema).optional()
      })
      .strict()
      .optional(),
    mcp: z
      .object({
        servers: z
          .array(
            z.union([
              z
                .object({
                  id: z.string(),
                  transport: z.literal('stdio'),
                  command: z.string(),
                  args: z.array(z.string()).optional()
                })
                .strict(),
              z
                .object({
                  id: z.string(),
                  transport: z.literal('sse'),
                  url: z.string()
                })
                .strict()
            ])
          )
          .optional()
      })
      .optional()
  })
  .strict();

export type CodexConfig = z.infer<typeof configSchema>;

export interface LoadConfigOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

function applyProviderEnvFallback(config: CodexConfig, env: NodeJS.ProcessEnv): CodexConfig {
  switch (config.provider.type) {
    case 'right-codes': {
      const resolved = resolveRightCodesConfig(config.provider, env);
      return {
        ...config,
        provider: {
          ...config.provider,
          apiKey: resolved.apiKey,
          baseUrl: resolved.baseUrl
        }
      };
    }
    case 'openai-compatible': {
      const resolved = resolveOpenAICompatConfig(config.provider, env);
      return {
        ...config,
        provider: {
          ...config.provider,
          apiKey: resolved.apiKey,
          baseUrl: resolved.baseUrl
        }
      };
    }
    case 'anthropic': {
      const resolved = resolveAnthropicConfig(config.provider, env);
      return {
        ...config,
        provider: {
          ...config.provider,
          apiKey: resolved.apiKey
        }
      };
    }
    case 'google': {
      const resolved = resolveGoogleConfig(config.provider, env);
      return {
        ...config,
        provider: {
          ...config.provider,
          apiKey: resolved.apiKey
        }
      };
    }
    case 'ollama': {
      const resolved = resolveOllamaConfig(config.provider, env);
      return {
        ...config,
        provider: {
          ...config.provider,
          baseUrl: resolved.baseUrl
        }
      };
    }
  }
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
  return applyProviderEnvFallback(parsed, env);
}
