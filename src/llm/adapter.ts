import { streamText as defaultStreamText } from 'ai';
import { createOpenAI as defaultCreateOpenAI } from '@ai-sdk/openai';

import { resolveRightCodesConfig } from './providers/right-codes.js';
import type { LLMConfig, LLMMessage, LLMStreamChunk } from './types.js';

type ModelResolver = (modelId: string) => any;

interface AdapterDeps {
  createOpenAI?: (options: {
    apiKey: string;
    baseURL: string;
    compatibility: 'compatible';
  }) => ModelResolver;
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
    const provider = resolveRightCodesConfig(config.provider, env);

    const createOpenAI = deps.createOpenAI ?? defaultCreateOpenAI;
    const streamTextImpl =
      deps.streamText ??
      ((defaultStreamText as unknown) as (options: any) => Promise<{ textStream: AsyncIterable<string> }>);

    const modelResolver = createOpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.baseUrl,
      compatibility: 'compatible'
    });

    const defaultModel = provider.defaultModel ?? config.models.primary;

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
