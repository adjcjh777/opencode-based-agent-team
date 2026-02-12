import React from 'react';
import { Text } from 'ink';

import type { UiMessage } from '../types.js';
import { formatChatLines } from '../formatters.js';

export interface ChatProps {
  messages: UiMessage[];
}

export function Chat({ messages }: ChatProps): React.ReactElement {
  return <Text>{formatChatLines(messages).join('\n')}</Text>;
}
