import { spawn } from 'node:child_process';

import type { ToolDefinition } from '../types.js';

export interface BashArgs {
  command: string;
  cwd?: string;
}

export interface BashResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export function createBashTool(): ToolDefinition<BashArgs, BashResult> {
  return {
    name: 'bash',
    description: 'Execute command with PowerShell on Windows',
    execute: async ({ command, cwd }) => {
      return new Promise((resolve, reject) => {
        const child = spawn(
          'powershell.exe',
          ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', command],
          {
          cwd,
          stdio: ['ignore', 'pipe', 'pipe']
          }
        );

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (chunk: Buffer | string) => {
          stdout += chunk.toString();
        });

        child.stderr.on('data', (chunk: Buffer | string) => {
          stderr += chunk.toString();
        });

        child.on('error', (error) => reject(error));
        child.on('close', (code) => {
          resolve({
            exitCode: code ?? 1,
            stdout,
            stderr
          });
        });
      });
    }
  };
}
