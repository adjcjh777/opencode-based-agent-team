import { describe, expect, it } from 'vitest';

import { createBuiltinSubagents, registerBuiltinSubagents } from '../../../src/agent/subagent.js';
import { AgentRegistry } from '../../../src/agent/registry.js';

describe('builtin subagents', () => {
  it('creates general and explore subagents', () => {
    const agents = createBuiltinSubagents();

    expect(agents.map((agent) => agent.id)).toEqual(['general', 'explore']);
    expect(agents.every((agent) => agent.mode === 'subagent')).toBe(true);
  });

  it('registers subagents into registry', () => {
    const registry = new AgentRegistry();

    registerBuiltinSubagents(registry);

    expect(registry.getById('general')?.name).toBe('General Subagent');
    expect(registry.getById('explore')?.name).toBe('Explore Subagent');
  });
});
