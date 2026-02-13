import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCli } from '../../../src/cli.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagent-command-surface-test-'));
  tempDirs.push(dir);
  return dir;
}

async function writeConfig(cwd: string, extra: Record<string, unknown> = {}): Promise<void> {
  await writeFile(
    join(cwd, 'codex.config.json'),
    JSON.stringify(
      {
        provider: {
          type: 'right-codes',
          apiKey: 'test-key',
          baseUrl: 'https://example.right.codes/v1'
        },
        models: {
          primary: 'claude-sonnet-4',
          fast: 'claude-haiku-4',
          reasoning: 'claude-opus-4'
        },
        ...extra
      },
      null,
      2
    )
  );
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('core command surface', () => {
  it('registers mcp, agent, session, and team commands', () => {
    const program = createCli();
    const names = program.commands.map((command) => command.name());

    expect(names).toContain('mcp');
    expect(names).toContain('agent');
    expect(names).toContain('session');
    expect(names).toContain('team');
  });

  it('mcp list command prints configured servers', async () => {
    const cwd = await createTempDir();
    await writeConfig(cwd, {
      mcp: {
        servers: [
          {
            id: 'filesystem',
            transport: 'stdio',
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem']
          },
          {
            id: 'search',
            transport: 'sse',
            url: 'http://localhost:8080/sse'
          }
        ]
      }
    });

    const output: string[] = [];
    const writeSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        output.push(typeof chunk === 'string' ? chunk : chunk.toString());
        return true;
      });

    try {
      const program = createCli({ cwd, env: {} });
      await program.parseAsync(['node', 'codexagentteams', 'mcp', 'list'], { from: 'node' });
    } finally {
      writeSpy.mockRestore();
    }

    const text = output.join('');
    expect(text).toContain('filesystem');
    expect(text).toContain('search');
  });

  it('agent list command prints builtin agents', async () => {
    const output: string[] = [];
    const writeSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        output.push(typeof chunk === 'string' ? chunk : chunk.toString());
        return true;
      });

    try {
      const program = createCli();
      await program.parseAsync(['node', 'codexagentteams', 'agent', 'list'], { from: 'node' });
    } finally {
      writeSpy.mockRestore();
    }

    const text = output.join('');
    expect(text).toContain('build');
    expect(text).toContain('plan');
  });

  it('session list prints empty state for fresh store', async () => {
    const cwd = await createTempDir();
    await writeConfig(cwd);

    const output: string[] = [];
    const writeSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        output.push(typeof chunk === 'string' ? chunk : chunk.toString());
        return true;
      });

    try {
      const program = createCli({ cwd, codexHome: join(cwd, '.codex') });
      await program.parseAsync(['node', 'codexagentteams', 'session', 'list'], { from: 'node' });
    } finally {
      writeSpy.mockRestore();
    }

    expect(output.join('')).toContain('No sessions found');
  });

  it('team run command plans and assigns tasks', async () => {
    const cwd = await createTempDir();
    await writeConfig(cwd, {
      team: {
        enabled: true,
        maxTeammates: 2,
        strategy: 'balanced',
        worker: 'in-process'
      }
    });

    const output: string[] = [];
    const writeSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        output.push(typeof chunk === 'string' ? chunk : chunk.toString());
        return true;
      });

    try {
      const program = createCli({ cwd, env: {} });
      await program.parseAsync(
        ['node', 'codexagentteams', 'team', 'run', 'Implement parser; Add tests'],
        {
          from: 'node'
        }
      );
    } finally {
      writeSpy.mockRestore();
    }

    const text = output.join('');
    expect(text).toContain('Team run complete');
    expect(text).toContain('teammate-1');
  });
});

