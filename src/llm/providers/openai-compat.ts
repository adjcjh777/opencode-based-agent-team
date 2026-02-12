import { createOpenAI as defaultCreateOpenAI } from '@ai-sdk/openai';

import type { OpenAICompatResolvedConfig } from './right-codes.js';

type OpenAIModelResolver = (modelId: string) => any;

interface OpenAICompatFactoryDeps {
  createOpenAI?: (options: {
    apiKey: string;
    baseURL: string;
    compatibility: 'compatible';
  }) => OpenAIModelResolver;
}

export function createOpenAICompatModelResolver(
  config: OpenAICompatResolvedConfig,
  deps: OpenAICompatFactoryDeps = {}
): OpenAIModelResolver {
  const createOpenAI = deps.createOpenAI ?? defaultCreateOpenAI;
  return createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    compatibility: 'compatible'
  });
}
