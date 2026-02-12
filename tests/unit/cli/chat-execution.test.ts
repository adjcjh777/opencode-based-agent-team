import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCli } from '../../../src/cli.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagent-chat-execution-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('chat command execution context', () => {
  it('builds system prompt with agent file and matched skills', async () => {
    const root = await createTempDir();
    const agentsDir = join(root, 'agents');
    const projectSkillsDir = join(root, '.codex', 'skills');

    await mkdir(agentsDir, { recursive: true });
    await mkdir(projectSkillsDir, { recursive: true });

    await writeFile(join(agentsDir, 'build.md'), 'Build prompt base.\n');
    await writeFile(
      join(projectSkillsDir, 'review.md'),
      ['---', 'name: review', 'description: review skill', 'trigger: review', '---', 'Review prompt ext.'].join('\n')
    );

    const payloads: Array<{ systemPrompt?: string }> = [];
    const runChat = vi.fn(async (options: { systemPrompt?: string }) => {
      payloads.push(options);
    });
    const program = createCli({
      runChat,
      cwd: root,
      codexHome: await createTempDir()
    });

    await program.parseAsync(['node', 'codexagentteams', 'chat', '--message', 'please review this'], {
      from: 'node'
    });

    const payload = payloads[0];
    expect(payload).toBeDefined();

    expect(payload?.systemPrompt).toContain('Build prompt base.');
    expect(payload?.systemPrompt).toContain('Skill: review');
    expect(payload?.systemPrompt).toContain('Review prompt ext.');
  });
});
