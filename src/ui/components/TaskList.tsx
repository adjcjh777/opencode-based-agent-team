import React from 'react';
import { Text } from 'ink';

export function formatTaskListLines(lines: string[]): string[] {
  return ['=== Tasks ===', ...lines];
}

export interface TaskListProps {
  lines: string[];
}

export function TaskList({ lines }: TaskListProps): React.ReactElement {
  return <Text>{formatTaskListLines(lines).join('\n')}</Text>;
}
