import React from 'react';
import { Box, Text } from 'ink';

import type { AppProps } from './types.js';
import { renderAppToLines } from './renderer.js';

export function App({ activeAgent, messages }: AppProps): React.ReactElement {
  const lines = renderAppToLines({ activeAgent, messages });

  return (
    <Box flexDirection="column">
      {lines.map((line, index) => (
        <Text key={`${line}-${index}`}>{line}</Text>
      ))}
    </Box>
  );
}
