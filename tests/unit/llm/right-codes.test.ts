import { describe, expect, it } from 'vitest';

import { resolveRightCodesConfig } from '../../../src/llm/providers/right-codes.js';

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
