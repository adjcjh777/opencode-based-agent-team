import React from 'react';
import { Text } from 'ink';

export function formatTeamPanelLines(lines: string[]): string[] {
  return ['=== Team Panel ===', ...lines];
}

export interface TeamPanelProps {
  lines: string[];
}

export function TeamPanel({ lines }: TeamPanelProps): React.ReactElement {
  return <Text>{formatTeamPanelLines(lines).join('\n')}</Text>;
}
