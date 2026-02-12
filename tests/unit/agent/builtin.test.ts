import { describe, expect, it } from 'vitest';

import { createBuiltinPrimaryAgents, registerBuiltinPrimaryAgents } from '../../../src/agent/builtin.js';
import { AgentRegistry } from '../../../src/agent/registry.js';

describe('builtin primary agents', () => {
  it('creates build and plan agents with expected ids', () => {
    const agents = createBuiltinPrimaryAgents();
    const ids = agents.map((agent) => agent.id);

    expect(ids).toEqual(['build', 'plan']);
  });

  it('configures plan agent as read-only for write/edit/bash/patch', () => {
    const agents = createBuiltinPrimaryAgents();
    const plan = agents.find((agent) => agent.id === 'plan');

    expect(plan).toBeDefined();
    expect(plan?.tools.write).toBe(false);
    expect(plan?.tools.edit).toBe(false);
    expect(plan?.tools.bash).toBe(false);
    expect(plan?.tools.patch).toBe(false);
  });

  it('registers builtin agents into registry', () => {
    const registry = new AgentRegistry();

    registerBuiltinPrimaryAgents(registry);

    expect(registry.getById('build')?.name).toBe('Build Agent');
    expect(registry.getById('plan')?.name).toBe('Plan Agent');
  });
});
