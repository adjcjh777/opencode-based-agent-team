import type { AgentConfig } from './types.js';

export class AgentRegistry {
  private readonly agents = new Map<string, AgentConfig>();

  register(agent: AgentConfig): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent already registered: ${agent.id}`);
    }

    this.agents.set(agent.id, agent);
  }

  getById(id: string): AgentConfig | undefined {
    return this.agents.get(id);
  }

  list(): AgentConfig[] {
    return [...this.agents.values()];
  }
}
