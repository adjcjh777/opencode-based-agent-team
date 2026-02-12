import { describe, expect, it, vi } from 'vitest';

import { createCli } from '../../../src/cli.js';

describe('createCli', () => {
  it('creates root command with expected metadata', () => {
    const program = createCli();

    expect(program.name()).toBe('codexagentteams');
    expect(program.description()).toContain('Agent Teams');
    expect(program.version()).toBe('0.1.0');
  });

  it('registers chat and config commands', () => {
    const program = createCli();
    const names = program.commands.map((command) => command.name());

    expect(names).toContain('chat');
    expect(names).toContain('config');
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
});
