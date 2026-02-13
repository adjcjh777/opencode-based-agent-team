import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCli } from '../../../src/cli.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagent-cli-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  process.exitCode = 0;
});

describe('createCli', () => {
  it('creates root command with expected metadata', () => {
    const program = createCli();

    expect(program.name()).toBe('codexagentteams');
    expect(program.description()).toContain('Agent Teams');
    expect(program.version()).toBe('0.1.0');
  });

  it('registers chat, config, and doctor commands', () => {
    const program = createCli();
    const names = program.commands.map((command) => command.name());

    expect(names).toContain('chat');
    expect(names).toContain('config');
    expect(names).toContain('doctor');
  });

  it('chat command enables ink ui mode and forwards options', async () => {
    const runChat = vi.fn(async () => undefined);
    const output: string[] = [];
    const writeSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        output.push(typeof chunk === 'string' ? chunk : chunk.toString());
        return true;
      });

    const previous = process.env.CODEXAGENTTEAMS_UI;
    delete process.env.CODEXAGENTTEAMS_UI;

    try {
      const program = createCli({ runChat });
      await program.parseAsync(['node', 'codexagentteams', 'chat', '--agent', 'plan', '--message', 'hello'], {
        from: 'node'
      });

      expect(process.env.CODEXAGENTTEAMS_UI).toBe('1');
      expect(runChat).toHaveBeenCalledTimes(1);
      expect(runChat).toHaveBeenCalledWith(
        expect.objectContaining({
          agent: 'plan',
          message: 'hello'
        })
      );
    } finally {
      writeSpy.mockRestore();
      if (previous === undefined) {
        delete process.env.CODEXAGENTTEAMS_UI;
      } else {
        process.env.CODEXAGENTTEAMS_UI = previous;
      }
    }

    expect(output.join('')).toBe('');
  });

  it('chat command prints startup message by default handler', async () => {
    const output: string[] = [];
    const writeSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        output.push(typeof chunk === 'string' ? chunk : chunk.toString());
        return true;
      });

    try {
      const program = createCli();
      await program.parseAsync(['node', 'codexagentteams', 'chat'], { from: 'node' });
    } finally {
      writeSpy.mockRestore();
    }

    expect(output.join('')).toContain('Starting chat session with build agent...');
  });

  it('config validate prints a summary for valid config', async () => {
    const cwd = await createTempDir();
    await writeFile(
      join(cwd, 'codex.config.json'),
      JSON.stringify({
        provider: {
          type: 'right-codes',
          apiKey: 'test-key',
          baseUrl: 'https://example.right.codes/v1'
        },
        models: {
          primary: 'claude-sonnet-4',
          fast: 'claude-haiku-4',
          reasoning: 'claude-opus-4'
        }
      })
    );

    const output: string[] = [];
    const writeSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        output.push(typeof chunk === 'string' ? chunk : chunk.toString());
        return true;
      });

    try {
      const program = createCli({ cwd, env: {} });
      await program.parseAsync(['node', 'codexagentteams', 'config', 'validate'], { from: 'node' });
    } finally {
      writeSpy.mockRestore();
    }

    const text = output.join('');
    expect(text).toContain('Configuration is valid.');
    expect(text).toContain('Provider: right-codes');
  });

  it('doctor command returns failing report when config is missing', async () => {
    const cwd = await createTempDir();
    const output: string[] = [];
    const writeSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        output.push(typeof chunk === 'string' ? chunk : chunk.toString());
        return true;
      });

    try {
      const program = createCli({ cwd, env: {} });
      await program.parseAsync(['node', 'codexagentteams', 'doctor', '--json'], { from: 'node' });
    } finally {
      writeSpy.mockRestore();
    }

    const report = JSON.parse(output.join('')) as {
      ok: boolean;
      checks: Array<{ id: string; status: string }>;
    };

    expect(report.ok).toBe(false);
    expect(report.checks.find((check) => check.id === 'config-file')?.status).toBe('fail');
    expect(process.exitCode).toBe(1);
  });
});
