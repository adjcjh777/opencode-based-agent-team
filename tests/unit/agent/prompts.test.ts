import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { loadAgentPrompt } from '../../../src/agent/prompts.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagent-prompts-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('agent prompt loader', () => {
  it('loads agent prompt from project agents directory', async () => {
    const root = await createTempDir();
    const agentsDir = join(root, 'agents');
    await mkdir(agentsDir, { recursive: true });
    await writeFile(join(agentsDir, 'build.md'), 'You are Build Agent.\n');

    const prompt = await loadAgentPrompt('build', { projectRoot: root });

    expect(prompt).toBe('You are Build Agent.');
  });

  it('returns undefined when prompt file is missing', async () => {
    const root = await createTempDir();

    await expect(loadAgentPrompt('plan', { projectRoot: root })).resolves.toBeUndefined();
  });
});
