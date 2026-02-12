import { createOpenAI as defaultCreateOpenAI } from '@ai-sdk/openai';

import type { RightCodesResolvedConfig } from './right-codes.js';

type OpenAIModelResolver = (modelId: string) => any;

interface RightCodesFactoryDeps {
  createOpenAI?: (options: {
    apiKey: string;
    baseURL: string;
    compatibility: 'compatible';
  }) => OpenAIModelResolver;
}

export function createRightCodesModelResolver(
  config: RightCodesResolvedConfig,
  deps: RightCodesFactoryDeps = {}
): OpenAIModelResolver {
  const createOpenAI = deps.createOpenAI ?? defaultCreateOpenAI;
  return createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    compatibility: 'compatible'
  });
}
