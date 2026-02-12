import { readFile, writeFile } from 'node:fs/promises';

import type { ToolDefinition } from '../types.js';

export interface PatchReplacement {
  from: string;
  to: string;
}

export interface PatchArgs {
  path: string;
  replacements: PatchReplacement[];
  strict?: boolean;
}

export interface PatchResult {
  updated: boolean;
  applied: number;
}

export function createPatchTool(): ToolDefinition<PatchArgs, PatchResult> {
  return {
    name: 'patch',
    description: 'Apply replacement patches to a file',
    execute: async ({ path, replacements, strict = false }) => {
      let content = await readFile(path, 'utf8');
      let applied = 0;

      for (const replacement of replacements) {
        if (!content.includes(replacement.from)) {
          if (strict) {
            throw new Error(`Patch replacement not found: ${replacement.from}`);
          }

          continue;
        }

        content = content.replace(replacement.from, replacement.to);
        applied += 1;
      }

      if (applied > 0) {
        await writeFile(path, content, 'utf8');
      }

      return {
        updated: applied > 0,
        applied
      };
    }
  };
}
