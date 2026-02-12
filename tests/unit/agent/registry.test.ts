import { describe, expect, it } from 'vitest';

import { AgentRegistry } from '../../../src/agent/registry.js';
import type { AgentConfig } from '../../../src/agent/types.js';

const buildAgent: AgentConfig = {
  id: 'build',
  name: 'Build Agent',
  description: 'Full capability agent',
  mode: 'primary',
  model: 'claude-sonnet-4',
  prompt: 'You are build agent.',
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
};

const planAgent: AgentConfig = {
  id: 'plan',
  name: 'Plan Agent',
  description: 'Read-only planning agent',
  mode: 'primary',
  model: 'claude-sonnet-4',
  prompt: 'You are plan agent.',
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
};

describe('AgentRegistry', () => {
  it('registers and retrieves agents by id', () => {
    const registry = new AgentRegistry();

    registry.register(buildAgent);
    registry.register(planAgent);

    expect(registry.getById('build')?.name).toBe('Build Agent');
    expect(registry.getById('plan')?.mode).toBe('primary');
    expect(registry.getById('missing')).toBeUndefined();
  });

  it('returns all registered agents in insertion order', () => {
    const registry = new AgentRegistry();

    registry.register(buildAgent);
    registry.register(planAgent);

    expect(registry.list().map((agent) => agent.id)).toEqual(['build', 'plan']);
  });

  it('rejects duplicate agent id registration', () => {
    const registry = new AgentRegistry();

    registry.register(buildAgent);

    expect(() => registry.register(buildAgent)).toThrow('Agent already registered: build');
  });
});
