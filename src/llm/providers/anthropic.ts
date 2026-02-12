import { createAnthropic as defaultCreateAnthropic } from '@ai-sdk/anthropic';

import type { AnthropicResolvedConfig } from './right-codes.js';

type AnthropicModelResolver = (modelId: string) => any;

interface AnthropicFactoryDeps {
  createAnthropic?: (options: { apiKey: string }) => AnthropicModelResolver;
}

export function createAnthropicModelResolver(
  config: AnthropicResolvedConfig,
  deps: AnthropicFactoryDeps = {}
): AnthropicModelResolver {
  const createAnthropic = deps.createAnthropic ?? defaultCreateAnthropic;
  return createAnthropic({ apiKey: config.apiKey });
}
