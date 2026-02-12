import type { AgentRegistry } from './registry.js';
import type { AgentConfig, ToolPermissions } from './types.js';

function allEnabledTools(): ToolPermissions {
  return {
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
  };
}

function planTools(): ToolPermissions {
  return {
    ...allEnabledTools(),
    write: false,
    edit: false,
    bash: false,
    patch: false
  };
}

export function createBuiltinPrimaryAgents(): AgentConfig[] {
  return [
    {
      id: 'build',
      name: 'Build Agent',
      description: 'Full capability development agent',
      mode: 'primary',
      model: 'claude-sonnet-4',
      prompt: 'You are Build Agent. Implement and ship requested changes.',
      tools: allEnabledTools(),
      color: 'green'
    },
    {
      id: 'plan',
      name: 'Plan Agent',
      description: 'Read-only planning and analysis agent',
      mode: 'primary',
      model: 'claude-sonnet-4',
      prompt: 'You are Plan Agent. Analyze and plan without mutating files.',
      tools: planTools(),
      color: 'blue'
    }
  ];
}

export function registerBuiltinPrimaryAgents(registry: AgentRegistry): void {
  for (const agent of createBuiltinPrimaryAgents()) {
    registry.register(agent);
  }
}
