import { spawn } from 'node:child_process';

import type { SkillConfig } from './types.js';

export class SkillExecutor {
  async activate(skill: SkillConfig, basePrompt: string): Promise<string> {
    const merged = [
      basePrompt.trim(),
      '',
      `Skill: ${skill.name}`,
      skill.prompt.trim()
    ]
      .filter(Boolean)
      .join('\n');

    return merged;
  }

  async runScript(scriptPath: string, args: string[] = []): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(scriptPath, args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

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
        if (code === 0) {
          resolve(stdout);
          return;
        }

        reject(new Error(`Skill script failed with code ${code}: ${stderr}`));
      });
    });
  }
}
