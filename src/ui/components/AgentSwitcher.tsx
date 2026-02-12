import React from 'react';
import { Text } from 'ink';
import { formatAgentSwitcherLine } from '../formatters.js';

export interface AgentSwitcherProps {
  agents: string[];
  activeAgent: string;
}

export function AgentSwitcher({ agents, activeAgent }: AgentSwitcherProps): React.ReactElement {
  return <Text>{formatAgentSwitcherLine(agents, activeAgent)}</Text>;
}
