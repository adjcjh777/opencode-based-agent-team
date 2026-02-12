import type { ToolDefinition } from '../types.js';

export interface WebSearchArgs {
  query: string;
  endpoint?: string;
}

export interface WebSearchEntry {
  title: string;
  url: string;
  snippet?: string;
}

export interface WebSearchResult {
  results: WebSearchEntry[];
}

export function createWebSearchTool(): ToolDefinition<WebSearchArgs, WebSearchResult> {
  return {
    name: 'websearch',
    description: 'Search from JSON endpoint returning { results: [...] } payload',
    execute: async ({ query, endpoint = 'https://api.duckduckgo.com/' }) => {
      const target = new URL(endpoint);
      target.searchParams.set('q', query);

      const response = await fetch(target, {
        headers: {
          accept: 'application/json'
        }
      });

      const payload = (await response.json()) as { results?: WebSearchEntry[] };
      return {
        results: payload.results ?? []
      };
    }
  };
}
