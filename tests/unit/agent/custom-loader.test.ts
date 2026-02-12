import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { loadAgentFile, loadAgentsFromDirectory } from '../../../src/agent/custom-loader.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagent-loader-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('custom agent loader', () => {
  it('loads agent from json file', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'security-agent.json');

    await writeFile(
      filePath,
      JSON.stringify({
        id: 'security',
        name: 'Security Agent',
        description: 'Security focused checks',
        mode: 'subagent',
        model: 'claude-haiku-4',
        prompt: 'Focus on vulnerabilities.',
        tools: {
          read: true,
          write: false,
          edit: false,
          bash: false,
          grep: true,
          glob: true,
          list: true,
          patch: false,
          webfetch: true,
          websearch: true
        }
      })
    );

    const agent = await loadAgentFile(filePath);

    expect(agent.id).toBe('security');
    expect(agent.mode).toBe('subagent');
    expect(agent.prompt).toContain('vulnerabilities');
  });

  it('loads agent from markdown file with frontmatter', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'planner-agent.md');

    await writeFile(
      filePath,
      [
        '---',
        'id: planner',
        'name: Planner Agent',
        'description: Planning specialist',
        'mode: primary',
        'model: claude-sonnet-4',
        'tools.read: true',
        'tools.write: false',
        'tools.edit: false',
        'tools.bash: false',
        'tools.grep: true',
        'tools.glob: true',
        'tools.list: true',
        'tools.patch: false',
        'tools.webfetch: true',
        'tools.websearch: true',
        '---',
        'You are a planning specialist.'
      ].join('\n')
    );

    const agent = await loadAgentFile(filePath);

    expect(agent.id).toBe('planner');
    expect(agent.mode).toBe('primary');
    expect(agent.prompt).toBe('You are a planning specialist.');
  });

  it('loads and sorts agent files from directory', async () => {
    const dir = await createTempDir();

    await writeFile(
      join(dir, 'b-agent.json'),
      JSON.stringify({
        id: 'b-agent',
        name: 'B Agent',
        description: 'B',
        mode: 'subagent',
        model: 'claude-haiku-4',
        prompt: 'B prompt',
        tools: {
          read: true,
          write: false,
          edit: false,
          bash: false,
          grep: true,
          glob: true,
          list: true,
          patch: false,
          webfetch: true,
          websearch: true
        }
      })
    );

    await writeFile(
      join(dir, 'a-agent.json'),
      JSON.stringify({
        id: 'a-agent',
        name: 'A Agent',
        description: 'A',
        mode: 'subagent',
        model: 'claude-haiku-4',
        prompt: 'A prompt',
        tools: {
          read: true,
          write: false,
          edit: false,
          bash: false,
          grep: true,
          glob: true,
          list: true,
          patch: false,
          webfetch: true,
          websearch: true
        }
      })
    );

    const agents = await loadAgentsFromDirectory(dir);

    expect(agents.map((agent) => agent.id)).toEqual(['a-agent', 'b-agent']);
  });
});
