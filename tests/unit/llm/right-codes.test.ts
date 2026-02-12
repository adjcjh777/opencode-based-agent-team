import { describe, expect, it } from 'vitest';

import {
  resolveRightCodesConfig,
  resolveOpenAICompatConfig,
  resolveAnthropicConfig,
  resolveGoogleConfig,
  resolveOllamaConfig
} from '../../../src/llm/providers/right-codes.js';

describe('resolveRightCodesConfig', () => {
  it('uses explicit config values before environment variables', () => {
    const resolved = resolveRightCodesConfig(
      {
        apiKey: 'explicit-key',
        baseUrl: 'https://explicit.right.codes/v1',
        defaultModel: 'claude-sonnet-4'
      },
      {
        RC_API_KEY: 'env-key',
        RC_BASE_URL: 'https://env.right.codes/v1'
      }
    );

    expect(resolved.apiKey).toBe('explicit-key');
    expect(resolved.baseUrl).toBe('https://explicit.right.codes/v1');
    expect(resolved.defaultModel).toBe('claude-sonnet-4');
  });

  it('falls back to RC_API_KEY and RC_BASE_URL from environment', () => {
    const resolved = resolveRightCodesConfig(
      {
        defaultModel: 'claude-haiku-4'
      },
      {
        RC_API_KEY: 'env-key',
        RC_BASE_URL: 'https://env.right.codes/v1'
      }
    );

    expect(resolved.apiKey).toBe('env-key');
    expect(resolved.baseUrl).toBe('https://env.right.codes/v1');
    expect(resolved.defaultModel).toBe('claude-haiku-4');
  });

  it('throws when credentials are missing in both config and env', () => {
    expect(() =>
      resolveRightCodesConfig(
        {
          defaultModel: 'claude-sonnet-4'
        },
        {}
      )
    ).toThrow('Missing right.codes credentials');
  });
});

describe('multi-provider resolvers', () => {
  it('resolves openai-compatible credentials from env fallback', () => {
    const resolved = resolveOpenAICompatConfig(
      {
        baseUrl: '${OPENAI_COMPAT_BASE_URL}',
        apiKey: '${OPENAI_COMPAT_API_KEY}'
      },
      {
        OPENAI_COMPAT_BASE_URL: 'https://proxy.example.com/v1',
        OPENAI_COMPAT_API_KEY: 'compat-key'
      }
    );

    expect(resolved.baseUrl).toBe('https://proxy.example.com/v1');
    expect(resolved.apiKey).toBe('compat-key');
  });

  it('resolves anthropic credentials', () => {
    const resolved = resolveAnthropicConfig({ apiKey: 'anthropic-key' }, {});

    expect(resolved.apiKey).toBe('anthropic-key');
  });

  it('resolves google credentials', () => {
    const resolved = resolveGoogleConfig({ apiKey: 'google-key' }, {});

    expect(resolved.apiKey).toBe('google-key');
  });

  it('resolves ollama base URL with default fallback', () => {
    const explicit = resolveOllamaConfig({ baseUrl: 'http://localhost:11434/v1' }, {});
    const fallback = resolveOllamaConfig({}, {});

    expect(explicit.baseUrl).toBe('http://localhost:11434/v1');
    expect(fallback.baseUrl).toBe('http://localhost:11434/v1');
  });
});
