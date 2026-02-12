import React from 'react';
import { Text } from 'ink';
import { formatToolbarLine, type ToolbarState } from '../formatters.js';

export function Toolbar(props: ToolbarState): React.ReactElement {
  return <Text>{formatToolbarLine(props)}</Text>;
}
