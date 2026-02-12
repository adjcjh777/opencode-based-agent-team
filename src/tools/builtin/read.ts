import { readFile } from 'node:fs/promises';

import type { ToolDefinition } from '../types.js';

export interface ReadArgs {
  path: string;
}

export interface ReadResult {
  content: string;
}

export function createReadTool(): ToolDefinition<ReadArgs, ReadResult> {
  return {
    name: 'read',
    description: 'Read file content as utf-8 text',
    execute: async ({ path }) => {
      const content = await readFile(path, 'utf8');
      return { content };
    }
  };
}
