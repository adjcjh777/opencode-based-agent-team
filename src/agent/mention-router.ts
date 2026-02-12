import type { AgentRegistry } from './registry.js';

export interface MentionTarget {
  agentId: string;
  content: string;
}

const mentionPattern = /^@([a-zA-Z0-9_-]+)\s*(.*)$/;

export function resolveMentionTarget(
  input: string,
  registry: AgentRegistry
): MentionTarget | undefined {
  const match = input.trim().match(mentionPattern);

  if (!match) {
    return undefined;
  }

  const [, agentId, content] = match;

  if (!registry.getById(agentId)) {
    return undefined;
  }

  return {
    agentId,
    content: content.trim()
  };
}
