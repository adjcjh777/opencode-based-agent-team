export interface PermissionState {
  tool: string;
  decision: 'allow' | 'deny' | 'ask';
}

export function formatPermissionLine(state: PermissionState): string {
  return `Permission: ${state.decision} for tool ${state.tool}`;
}
