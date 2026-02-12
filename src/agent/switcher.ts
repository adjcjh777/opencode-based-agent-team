import type { AgentConfig } from './types.js';

export function cyclePrimaryAgent(currentId: string, agents: AgentConfig[]): string {
  const primaryIds = agents.filter((agent) => agent.mode === 'primary').map((agent) => agent.id);

  if (!primaryIds.length) {
    throw new Error('No primary agents available for switching.');
  }

  const currentIndex = primaryIds.indexOf(currentId);

  if (currentIndex < 0) {
    return primaryIds[0];
  }

  const nextIndex = (currentIndex + 1) % primaryIds.length;
  return primaryIds[nextIndex];
}
