import React from 'react';
import { Text } from 'ink';

export function formatTeammateViewLines(selected: string | undefined, lines: string[]): string[] {
  return ['=== Teammate ===', `Selected: ${selected ?? 'none'}`, ...lines];
}

export interface TeammateViewProps {
  selected?: string;
  lines: string[];
}

export function TeammateView({ selected, lines }: TeammateViewProps): React.ReactElement {
  return <Text>{formatTeammateViewLines(selected, lines).join('\n')}</Text>;
}
