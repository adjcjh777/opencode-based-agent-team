import { writeFile } from 'node:fs/promises';

import type { ToolDefinition } from '../types.js';

export interface WriteArgs {
  path: string;
  content: string;
}

export interface WriteResult {
  bytesWritten: number;
}

export function createWriteTool(): ToolDefinition<WriteArgs, WriteResult> {
  return {
    name: 'write',
    description: 'Write utf-8 text to file',
    execute: async ({ path, content }) => {
      await writeFile(path, content, 'utf8');
      return { bytesWritten: Buffer.byteLength(content, 'utf8') };
    }
  };
}
