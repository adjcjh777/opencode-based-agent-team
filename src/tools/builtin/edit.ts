import { readFile, writeFile } from 'node:fs/promises';

import type { ToolDefinition } from '../types.js';

export interface EditArgs {
  path: string;
  search: string;
  replace: string;
}

export interface EditResult {
  updated: boolean;
}

export function createEditTool(): ToolDefinition<EditArgs, EditResult> {
  return {
    name: 'edit',
    description: 'Replace first occurrence of text in file',
    execute: async ({ path, search, replace }) => {
      const original = await readFile(path, 'utf8');
      const updated = original.includes(search);
      const output = original.replace(search, replace);

      if (updated) {
        await writeFile(path, output, 'utf8');
      }

      return { updated };
    }
  };
}
