import { describe, expect, it } from 'vitest';

import {
  formatAgentSwitcherLine,
  formatChatLines,
  formatInputLine,
  formatToolbarLine
} from '../../../src/ui/formatters.js';

describe('ui formatters', () => {
  it('formats chat lines for user and assistant messages', () => {
    expect(
      formatChatLines([
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi there' }
      ])
    ).toEqual(['You: hello', 'Assistant: hi there']);
  });

  it('formats input line with prompt', () => {
    expect(formatInputLine('build plan')).toBe('> build plan');
  });

  it('formats toolbar line with active skill and shortcuts', () => {
    expect(formatToolbarLine({ activeSkill: 'debug', shortcuts: ['Tab: switch', 'Shift+↑↓: teammate'] })).toContain(
      'Skill: debug'
    );
  });

  it('formats agent switcher line and marks active agent', () => {
    expect(formatAgentSwitcherLine(['build', 'plan', 'explore'], 'plan')).toBe('build  plan*  explore');
  });
});
