import { createGoogleGenerativeAI as defaultCreateGoogleGenerativeAI } from '@ai-sdk/google';

import type { GoogleResolvedConfig } from './right-codes.js';

type GoogleModelResolver = (modelId: string) => any;

interface GoogleFactoryDeps {
  createGoogle?: (options: { apiKey: string }) => GoogleModelResolver;
}

export function createGoogleModelResolver(
  config: GoogleResolvedConfig,
  deps: GoogleFactoryDeps = {}
): GoogleModelResolver {
  const createGoogle = deps.createGoogle ?? defaultCreateGoogleGenerativeAI;
  return createGoogle({ apiKey: config.apiKey });
}
