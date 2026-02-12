import React from 'react';
import { Text } from 'ink';

export interface PermissionState {
  tool: string;
  decision: 'allow' | 'deny' | 'ask';
}

export function formatPermissionLine(state: PermissionState): string {
  return `Permission: ${state.decision} for tool ${state.tool}`;
}

export function Permission(props: PermissionState): React.ReactElement {
  return <Text>{formatPermissionLine(props)}</Text>;
}
