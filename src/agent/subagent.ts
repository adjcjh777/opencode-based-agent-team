import type { AgentRegistry } from './registry.js';
import type { AgentConfig, ToolPermissions } from './types.js';

function subagentTools(): ToolPermissions {
  return {
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
  };
}

export function createBuiltinSubagents(): AgentConfig[] {
  return [
    {
      id: 'general',
      name: 'General Subagent',
      description: 'General-purpose subagent for multi-step support tasks',
      mode: 'subagent',
      model: 'claude-haiku-4',
      prompt: 'You are General Subagent. Help with broad support tasks.',
      tools: subagentTools(),
      color: 'cyan'
    },
    {
      id: 'explore',
      name: 'Explore Subagent',
      description: 'Code exploration focused subagent',
      mode: 'subagent',
      model: 'claude-haiku-4',
      prompt: 'You are Explore Subagent. Focus on discovering and summarizing code context.',
      tools: subagentTools(),
      color: 'magenta'
    }
  ];
}

export function registerBuiltinSubagents(registry: AgentRegistry): void {
  for (const agent of createBuiltinSubagents()) {
    registry.register(agent);
  }
}
