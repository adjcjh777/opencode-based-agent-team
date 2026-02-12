import { createOpenAI as defaultCreateOpenAI } from '@ai-sdk/openai';

import type { OllamaResolvedConfig } from './right-codes.js';

type OpenAIModelResolver = (modelId: string) => any;

interface OllamaFactoryDeps {
  createOpenAI?: (options: {
    apiKey: string;
    baseURL: string;
    compatibility: 'compatible';
  }) => OpenAIModelResolver;
}

export function createOllamaModelResolver(
  config: OllamaResolvedConfig,
  deps: OllamaFactoryDeps = {}
): OpenAIModelResolver {
  const createOpenAI = deps.createOpenAI ?? defaultCreateOpenAI;
  return createOpenAI({
    apiKey: 'ollama',
    baseURL: config.baseUrl,
    compatibility: 'compatible'
  });
}
