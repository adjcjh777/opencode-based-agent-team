import { describe, expect, it, vi } from 'vitest';

import { LLMAdapter } from '../../../src/llm/adapter.js';
import type { LLMConfig, LLMMessage } from '../../../src/llm/types.js';

function makeConfig(overrides: Partial<LLMConfig> = {}): LLMConfig {
  return {
    provider: {
      type: 'right-codes',
      apiKey: 'config-key',
      baseUrl: 'https://config.right.codes/v1',
      defaultModel: 'provider-default-model'
    },
    models: {
      primary: 'primary-model',
      fast: 'fast-model',
      reasoning: 'reasoning-model'
    },
    ...overrides
  };
}

const sampleMessages: LLMMessage[] = [{ role: 'user', content: 'hello' }];

describe('LLMAdapter', () => {
  it('uses provider.defaultModel when present', async () => {
    const streamText = vi.fn(async ({ model }: { model: { modelId: string }; messages: unknown[] }) => {
      async function* chunks(): AsyncIterable<string> {
        yield `model:${model.modelId}`;
      }
      return { textStream: chunks() };
    });

    const createOpenAI = vi.fn(() => (modelId: string) => ({ modelId }));

    const adapter = LLMAdapter.create(makeConfig(), {
      createOpenAI,
      streamText,
      env: {}
    });

    const output: string[] = [];
    for await (const chunk of adapter.chat(sampleMessages)) {
      output.push(chunk.text);
    }

    expect(output.join('')).toBe('model:provider-default-model');
    expect(createOpenAI).toHaveBeenCalledTimes(1);
  });

  it('falls back to models.primary when provider.defaultModel is missing', async () => {
    const streamText = vi.fn(async ({ model }: { model: { modelId: string }; messages: unknown[] }) => {
      async function* chunks(): AsyncIterable<string> {
        yield `model:${model.modelId}`;
      }
      return { textStream: chunks() };
    });

    const createOpenAI = vi.fn(() => (modelId: string) => ({ modelId }));

    const adapter = LLMAdapter.create(
      makeConfig({
        provider: {
          type: 'right-codes',
          apiKey: 'config-key',
          baseUrl: 'https://config.right.codes/v1'
        }
      }),
      {
        createOpenAI,
        streamText,
        env: {}
      }
    );

    const output: string[] = [];
    for await (const chunk of adapter.chat(sampleMessages)) {
      output.push(chunk.text);
    }

    expect(output.join('')).toBe('model:primary-model');
  });

  it('uses RC_* environment variables when provider credentials are placeholders', async () => {
    const createOpenAI = vi.fn(() => (modelId: string) => ({ modelId }));
    const streamText = vi.fn(async () => {
      async function* chunks(): AsyncIterable<string> {
        yield 'ok';
      }
      return { textStream: chunks() };
    });

    const adapter = LLMAdapter.create(
      makeConfig({
        provider: {
          type: 'right-codes',
          apiKey: '${RC_API_KEY}',
          baseUrl: '${RC_BASE_URL}'
        }
      }),
      {
        createOpenAI,
        streamText,
        env: {
          RC_API_KEY: 'env-key',
          RC_BASE_URL: 'https://env.right.codes/v1'
        }
      }
    );

    const output: string[] = [];
    for await (const chunk of adapter.chat(sampleMessages)) {
      output.push(chunk.text);
    }

    expect(output.join('')).toBe('ok');
    expect(createOpenAI).toHaveBeenCalledWith({
      apiKey: 'env-key',
      baseURL: 'https://env.right.codes/v1',
      compatibility: 'compatible'
    });
  });
});
