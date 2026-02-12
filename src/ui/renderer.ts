import type { AppProps } from './types.js';

export function renderAppToLines({ activeAgent, messages }: AppProps): string[] {
  const lines = ['CodexAgentTeams v0.1.0', `Agent: ${activeAgent}`, '---'];

  for (const message of messages) {
    lines.push(`${message.role === 'user' ? 'You' : 'Assistant'}: ${message.content}`);
  }

  lines.push('> _');
  return lines;
}
