import { describe, expect, it } from 'vitest';

import { resolveMentionTarget } from '../../../src/agent/mention-router.js';
import { AgentRegistry } from '../../../src/agent/registry.js';
import type { AgentConfig } from '../../../src/agent/types.js';

const generalAgent: AgentConfig = {
  id: 'general',
  name: 'General Subagent',
  description: 'General helper',
  mode: 'subagent',
  model: 'claude-haiku-4',
  prompt: 'general prompt',
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

describe('resolveMentionTarget', () => {
  it('resolves @mention to subagent id and stripped content', () => {
    const registry = new AgentRegistry();
    registry.register(generalAgent);

    const resolved = resolveMentionTarget('@general please inspect src', registry);

    expect(resolved).toEqual({
      agentId: 'general',
      content: 'please inspect src'
    });
  });

  it('returns undefined when no mention prefix exists', () => {
    const registry = new AgentRegistry();
    registry.register(generalAgent);

    expect(resolveMentionTarget('please inspect src', registry)).toBeUndefined();
  });

  it('returns undefined when mentioned id is not registered', () => {
    const registry = new AgentRegistry();

    expect(resolveMentionTarget('@missing task', registry)).toBeUndefined();
  });
});
