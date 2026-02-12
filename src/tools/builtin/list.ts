import { readdir } from 'node:fs/promises';

import type { ToolDefinition } from '../types.js';

export interface ListArgs {
  path: string;
}

export interface ListResult {
  entries: string[];
}

export function createListTool(): ToolDefinition<ListArgs, ListResult> {
  return {
    name: 'list',
    description: 'List directory entries',
    execute: async ({ path }) => {
      const entries = await readdir(path);
      return { entries };
    }
  };
}
