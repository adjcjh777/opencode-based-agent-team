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

  it('routes anthropic provider with anthropic model resolver', async () => {
    const createAnthropic = vi.fn(() => (modelId: string) => ({ modelId }));
    const streamText = vi.fn(async ({ model }: { model: { modelId: string } }) => {
      async function* chunks(): AsyncIterable<string> {
        yield `model:${model.modelId}`;
      }
      return { textStream: chunks() };
    });

    const adapter = LLMAdapter.create(
      {
        provider: {
          type: 'anthropic',
          apiKey: 'anthropic-key',
          defaultModel: 'claude-3-7-sonnet-latest'
        },
        models: {
          primary: 'claude-3-7-sonnet-latest',
          fast: 'claude-3-5-haiku-latest',
          reasoning: 'claude-3-7-sonnet-latest'
        }
      },
      {
        createAnthropic,
        streamText,
        env: {}
      }
    );

    const output: string[] = [];
    for await (const chunk of adapter.chat(sampleMessages)) {
      output.push(chunk.text);
    }

    expect(output.join('')).toBe('model:claude-3-7-sonnet-latest');
    expect(createAnthropic).toHaveBeenCalledWith({ apiKey: 'anthropic-key' });
  });

  it('routes google provider with google model resolver', async () => {
    const createGoogle = vi.fn(() => (modelId: string) => ({ modelId }));
    const streamText = vi.fn(async ({ model }: { model: { modelId: string } }) => {
      async function* chunks(): AsyncIterable<string> {
        yield `model:${model.modelId}`;
      }
      return { textStream: chunks() };
    });

    const adapter = LLMAdapter.create(
      {
        provider: {
          type: 'google',
          apiKey: 'google-key',
          defaultModel: 'gemini-2.0-flash'
        },
        models: {
          primary: 'gemini-2.0-flash',
          fast: 'gemini-2.0-flash-lite',
          reasoning: 'gemini-2.0-pro'
        }
      },
      {
        createGoogle,
        streamText,
        env: {}
      }
    );

    const output: string[] = [];
    for await (const chunk of adapter.chat(sampleMessages)) {
      output.push(chunk.text);
    }

    expect(output.join('')).toBe('model:gemini-2.0-flash');
    expect(createGoogle).toHaveBeenCalledWith({ apiKey: 'google-key' });
  });

  it('routes ollama provider through openai-compatible transport', async () => {
    const createOpenAI = vi.fn(() => (modelId: string) => ({ modelId }));
    const streamText = vi.fn(async ({ model }: { model: { modelId: string } }) => {
      async function* chunks(): AsyncIterable<string> {
        yield `model:${model.modelId}`;
      }
      return { textStream: chunks() };
    });

    const adapter = LLMAdapter.create(
      {
        provider: {
          type: 'ollama',
          baseUrl: 'http://localhost:11434/v1',
          defaultModel: 'qwen2.5-coder:latest'
        },
        models: {
          primary: 'qwen2.5-coder:latest',
          fast: 'qwen2.5:latest',
          reasoning: 'qwen2.5-coder:latest'
        }
      },
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

    expect(output.join('')).toBe('model:qwen2.5-coder:latest');
    expect(createOpenAI).toHaveBeenCalledWith({
      apiKey: 'ollama',
      baseURL: 'http://localhost:11434/v1',
      compatibility: 'compatible'
    });
  });
});
