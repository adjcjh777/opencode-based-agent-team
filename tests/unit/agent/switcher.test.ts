import { describe, expect, it } from 'vitest';

import { cyclePrimaryAgent } from '../../../src/agent/switcher.js';
import type { AgentConfig } from '../../../src/agent/types.js';

const primaryAgents: AgentConfig[] = [
  {
    id: 'build',
    name: 'Build Agent',
    description: '',
    mode: 'primary',
    model: 'claude-sonnet-4',
    prompt: '',
    tools: {
      read: true,
      write: true,
      edit: true,
      bash: true,
      grep: true,
      glob: true,
      list: true,
      patch: true,
      webfetch: true,
      websearch: true
    }
  },
  {
    id: 'plan',
    name: 'Plan Agent',
    description: '',
    mode: 'primary',
    model: 'claude-sonnet-4',
    prompt: '',
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
  }
];

describe('cyclePrimaryAgent', () => {
  it('switches to next primary agent', () => {
    expect(cyclePrimaryAgent('build', primaryAgents)).toBe('plan');
  });

  it('wraps around to first primary agent', () => {
    expect(cyclePrimaryAgent('plan', primaryAgents)).toBe('build');
  });

  it('falls back to first primary agent when current is unknown', () => {
    expect(cyclePrimaryAgent('unknown', primaryAgents)).toBe('build');
  });
});
