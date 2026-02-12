import fg from 'fast-glob';

import type { ToolDefinition } from '../types.js';

export interface GlobArgs {
  pattern: string;
  cwd?: string;
}

export interface GlobResult {
  matches: string[];
}

export function createGlobTool(): ToolDefinition<GlobArgs, GlobResult> {
  return {
    name: 'glob',
    description: 'Match file paths by glob pattern',
    execute: async ({ pattern, cwd }) => {
      const matches = await fg(pattern, {
        cwd,
        onlyFiles: true,
        dot: true
      });

      return { matches };
    }
  };
}
