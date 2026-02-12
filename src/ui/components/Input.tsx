import React from 'react';
import { Text } from 'ink';
import { formatInputLine } from '../formatters.js';

export interface InputProps {
  value: string;
}

export function Input({ value }: InputProps): React.ReactElement {
  return <Text>{formatInputLine(value)}</Text>;
}
