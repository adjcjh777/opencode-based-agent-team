import { describe, expect, it } from 'vitest';

import { normalizeArgvForDefaultCommand } from '../../../src/index.js';

describe('normalizeArgvForDefaultCommand', () => {
  it('injects chat when no command is provided', () => {
    expect(normalizeArgvForDefaultCommand(['node', 'codexagentteams'])).toEqual([
      'node',
      'codexagentteams',
      'chat'
    ]);
  });

  it('preserves explicit commands', () => {
    expect(normalizeArgvForDefaultCommand(['node', 'codexagentteams', 'doctor'])).toEqual([
      'node',
      'codexagentteams',
      'doctor'
    ]);
  });

  it('preserves root help/version flags', () => {
    expect(normalizeArgvForDefaultCommand(['node', 'codexagentteams', '--help'])).toEqual([
      'node',
      'codexagentteams',
      '--help'
    ]);

    expect(normalizeArgvForDefaultCommand(['node', 'codexagentteams', '--version'])).toEqual([
      'node',
      'codexagentteams',
      '--version'
    ]);
  });
});

