import { describe, expect, it, vi } from 'vitest';

import { createAnthropicModelResolver } from '../../../src/llm/providers/anthropic.js';
import { createGoogleModelResolver } from '../../../src/llm/providers/google.js';
import { createOllamaModelResolver } from '../../../src/llm/providers/ollama.js';
import { createOpenAICompatModelResolver } from '../../../src/llm/providers/openai-compat.js';
import { createRightCodesModelResolver } from '../../../src/llm/providers/right-codes-factory.js';

describe('provider factories', () => {
  it('builds right.codes resolver with openai-compatible client', () => {
    const createOpenAI = vi.fn(() => (model: string) => ({ model }));

    const resolver = createRightCodesModelResolver(
      {
        apiKey: 'rc-key',
        baseUrl: 'https://rc.example/v1'
      },
      { createOpenAI }
    );

    expect(resolver('claude-sonnet-4')).toEqual({ model: 'claude-sonnet-4' });
    expect(createOpenAI).toHaveBeenCalledWith({
      apiKey: 'rc-key',
      baseURL: 'https://rc.example/v1',
      compatibility: 'compatible'
    });
  });

  it('builds openai-compatible resolver', () => {
    const createOpenAI = vi.fn(() => (model: string) => ({ model }));

    const resolver = createOpenAICompatModelResolver(
      {
        apiKey: 'compat-key',
        baseUrl: 'https://proxy.example/v1'
      },
      { createOpenAI }
    );

    expect(resolver('gpt-4o')).toEqual({ model: 'gpt-4o' });
    expect(createOpenAI).toHaveBeenCalledWith({
      apiKey: 'compat-key',
      baseURL: 'https://proxy.example/v1',
      compatibility: 'compatible'
    });
  });

  it('builds anthropic resolver', () => {
    const createAnthropic = vi.fn(() => (model: string) => ({ model }));

    const resolver = createAnthropicModelResolver({ apiKey: 'anthropic-key' }, { createAnthropic });

    expect(resolver('claude-3-7-sonnet-latest')).toEqual({ model: 'claude-3-7-sonnet-latest' });
    expect(createAnthropic).toHaveBeenCalledWith({ apiKey: 'anthropic-key' });
  });

  it('builds google resolver', () => {
    const createGoogle = vi.fn(() => (model: string) => ({ model }));

    const resolver = createGoogleModelResolver({ apiKey: 'google-key' }, { createGoogle });

    expect(resolver('gemini-2.0-flash')).toEqual({ model: 'gemini-2.0-flash' });
    expect(createGoogle).toHaveBeenCalledWith({ apiKey: 'google-key' });
  });

  it('builds ollama resolver using openai-compatible transport', () => {
    const createOpenAI = vi.fn(() => (model: string) => ({ model }));

    const resolver = createOllamaModelResolver(
      {
        baseUrl: 'http://localhost:11434/v1'
      },
      { createOpenAI }
    );

    expect(resolver('qwen2.5-coder:latest')).toEqual({ model: 'qwen2.5-coder:latest' });
    expect(createOpenAI).toHaveBeenCalledWith({
      apiKey: 'ollama',
      baseURL: 'http://localhost:11434/v1',
      compatibility: 'compatible'
    });
  });
});
