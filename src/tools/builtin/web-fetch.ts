import type { ToolDefinition } from '../types.js';

export interface WebFetchArgs {
  url: string;
}

export interface WebFetchResult {
  status: number;
  body: string;
}

export function createWebFetchTool(): ToolDefinition<WebFetchArgs, WebFetchResult> {
  return {
    name: 'webfetch',
    description: 'Fetch web page body by URL',
    execute: async ({ url }) => {
      const response = await fetch(url);
      const body = await response.text();

      return {
        status: response.status,
        body
      };
    }
  };
}
