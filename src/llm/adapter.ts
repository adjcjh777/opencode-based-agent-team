import { streamText as defaultStreamText } from 'ai';

import {
  resolveAnthropicConfig,
  resolveGoogleConfig,
  resolveOllamaConfig,
  resolveOpenAICompatConfig,
  resolveRightCodesConfig
} from './providers/right-codes.js';
import { createAnthropicModelResolver } from './providers/anthropic.js';
import { createGoogleModelResolver } from './providers/google.js';
import { createOllamaModelResolver } from './providers/ollama.js';
import { createOpenAICompatModelResolver } from './providers/openai-compat.js';
import { createRightCodesModelResolver } from './providers/right-codes-factory.js';
import { toChunkStream } from './streaming.js';
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
    const streamTextImpl =
      deps.streamText ??
      ((defaultStreamText as unknown) as (options: any) => Promise<{ textStream: AsyncIterable<string> }>);

    let modelResolver: ModelResolver;
    let defaultModel = config.models.primary;

    switch (config.provider.type) {
      case 'right-codes': {
        const provider = resolveRightCodesConfig(config.provider, env);
        modelResolver = createRightCodesModelResolver(provider, {
          createOpenAI: deps.createOpenAI
        });
        defaultModel = provider.defaultModel ?? config.models.primary;
        break;
      }
      case 'openai-compatible': {
        const provider = resolveOpenAICompatConfig(config.provider, env);
        modelResolver = createOpenAICompatModelResolver(provider, {
          createOpenAI: deps.createOpenAI
        });
        defaultModel = provider.defaultModel ?? config.models.primary;
        break;
      }
      case 'anthropic': {
        const provider = resolveAnthropicConfig(config.provider, env);
        modelResolver = createAnthropicModelResolver(provider, {
          createAnthropic: deps.createAnthropic
        });
        defaultModel = provider.defaultModel ?? config.models.primary;
        break;
      }
      case 'google': {
        const provider = resolveGoogleConfig(config.provider, env);
        modelResolver = createGoogleModelResolver(provider, {
          createGoogle: deps.createGoogle
        });
        defaultModel = provider.defaultModel ?? config.models.primary;
        break;
      }
      case 'ollama': {
        const provider = resolveOllamaConfig(config.provider, env);
        modelResolver = createOllamaModelResolver(provider, {
          createOpenAI: deps.createOpenAI
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

    for await (const chunk of toChunkStream(result.textStream)) {
      yield chunk;
    }
  }
}
