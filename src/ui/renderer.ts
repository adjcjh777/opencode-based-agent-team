import type { AppProps } from './types.js';

export function renderAppToLines({ activeAgent, messages, teamDisplayLines = [] }: AppProps): string[] {
  const lines = ['CodexAgentTeams v0.1.0', `Agent: ${activeAgent}`, '---'];

  if (teamDisplayLines.length > 0) {
    lines.push('=== Team Status ===');
    lines.push(...teamDisplayLines);
    lines.push('---');
  }

  for (const message of messages) {
    lines.push(`${message.role === 'user' ? 'You' : 'Assistant'}: ${message.content}`);
  }

  lines.push('> _');
  return lines;
}
