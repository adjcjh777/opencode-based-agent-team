import { spawn } from 'node:child_process';

import type { ToolDefinition } from '../types.js';

export interface GrepArgs {
  pattern: string;
  path: string;
}

export interface GrepResult {
  matches: string[];
}

function runRipgrep(pattern: string, path: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const command = spawn('rg', ['--line-number', '--no-heading', pattern, path], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    command.stdout.on('data', (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    command.stderr.on('data', (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    command.on('error', (error) => {
      reject(error);
    });

    command.on('close', (code) => {
      if (code === 0 || code === 1) {
        const matches = stdout
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        resolve(matches);
        return;
      }

      reject(new Error(`ripgrep failed with code ${code}: ${stderr}`));
    });
  });
}

export function createGrepTool(): ToolDefinition<GrepArgs, GrepResult> {
  return {
    name: 'grep',
    description: 'Search files with ripgrep',
    execute: async ({ pattern, path }) => {
      const matches = await runRipgrep(pattern, path);
      return { matches };
    }
  };
}
