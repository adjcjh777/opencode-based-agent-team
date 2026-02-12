import { describe, expect, it } from 'vitest';

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
});
