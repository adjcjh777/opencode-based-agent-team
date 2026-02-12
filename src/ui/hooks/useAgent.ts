export interface AgentState {
  agents: string[];
  activeAgent: string;
}

export function createAgentState(agents: string[], activeAgent: string): AgentState {
  return { agents: [...agents], activeAgent };
}

export function setActiveAgent(state: AgentState, activeAgent: string): AgentState {
  if (!state.agents.includes(activeAgent)) {
    return state;
  }

  return { ...state, activeAgent };
}
