import { streamText as defaultStreamText } from 'ai';
import { createOpenAI as defaultCreateOpenAI } from '@ai-sdk/openai';

import {
  resolveAnthropicConfig,
  resolveGoogleConfig,
  resolveOllamaConfig,
  resolveOpenAICompatConfig,
  resolveRightCodesConfig
} from './providers/right-codes.js';
import type { LLMConfig, LLMMessage, LLMStreamChunk } from './types.js';

type ModelResolver = (modelId: string) => any;

interface AdapterDeps {
  createOpenAI?: (options: {
    apiKey: string;
    baseURL: string;
    compatibility: 'compatible';
  }) => ModelResolver;
  createAnthropic?: (options: { apiKey: string }) => ModelResolver;
  createGoogle?: (options: { apiKey: string }) => ModelResolver;
  streamText?: (options: any) => Promise<{ textStream: AsyncIterable<string> }>;
  env?: NodeJS.ProcessEnv;
}

export class LLMAdapter {
  private readonly modelResolver: ModelResolver;
  private readonly streamTextImpl: (options: any) => Promise<{ textStream: AsyncIterable<string> }>;
  private readonly defaultModel: string;

  private constructor(
    modelResolver: ModelResolver,
    streamTextImpl: (options: any) => Promise<{ textStream: AsyncIterable<string> }>,
    defaultModel: string
  ) {
    this.modelResolver = modelResolver;
    this.streamTextImpl = streamTextImpl;
    this.defaultModel = defaultModel;
  }

  static create(config: LLMConfig, deps: AdapterDeps = {}): LLMAdapter {
    const env = deps.env ?? process.env;

    const createOpenAI = deps.createOpenAI ?? defaultCreateOpenAI;
    const createAnthropic = deps.createAnthropic ?? (() => {
      throw new Error('Anthropic provider is not configured in this runtime.');
    });
    const createGoogle = deps.createGoogle ?? (() => {
      throw new Error('Google provider is not configured in this runtime.');
    });
    const streamTextImpl =
      deps.streamText ??
      ((defaultStreamText as unknown) as (options: any) => Promise<{ textStream: AsyncIterable<string> }>);

    let modelResolver: ModelResolver;
    let defaultModel = config.models.primary;

    switch (config.provider.type) {
      case 'right-codes': {
        const provider = resolveRightCodesConfig(config.provider, env);
        modelResolver = createOpenAI({
          apiKey: provider.apiKey,
          baseURL: provider.baseUrl,
          compatibility: 'compatible'
        });
        defaultModel = provider.defaultModel ?? config.models.primary;
        break;
      }
      case 'openai-compatible': {
        const provider = resolveOpenAICompatConfig(config.provider, env);
        modelResolver = createOpenAI({
          apiKey: provider.apiKey,
          baseURL: provider.baseUrl,
          compatibility: 'compatible'
        });
        defaultModel = provider.defaultModel ?? config.models.primary;
        break;
      }
      case 'anthropic': {
        const provider = resolveAnthropicConfig(config.provider, env);
        modelResolver = createAnthropic({ apiKey: provider.apiKey });
        defaultModel = provider.defaultModel ?? config.models.primary;
        break;
      }
      case 'google': {
        const provider = resolveGoogleConfig(config.provider, env);
        modelResolver = createGoogle({ apiKey: provider.apiKey });
        defaultModel = provider.defaultModel ?? config.models.primary;
        break;
      }
      case 'ollama': {
        const provider = resolveOllamaConfig(config.provider, env);
        modelResolver = createOpenAI({
          apiKey: 'ollama',
          baseURL: provider.baseUrl,
          compatibility: 'compatible'
        });
        defaultModel = provider.defaultModel ?? config.models.primary;
        break;
      }
    }

    return new LLMAdapter(modelResolver, streamTextImpl, defaultModel);
  }

  async *chat(messages: LLMMessage[]): AsyncIterable<LLMStreamChunk> {
    const result = await this.streamTextImpl({
      model: this.modelResolver(this.defaultModel),
      messages
    });

    for await (const text of result.textStream) {
      yield { text };
    }
  }
}
