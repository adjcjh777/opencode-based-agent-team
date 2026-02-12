import { describe, expect, it } from 'vitest';

import { renderAppToLines } from '../../../src/ui/renderer.js';

describe('renderAppToLines', () => {
  it('renders title, active agent and input prompt', () => {
    const lines = renderAppToLines({ activeAgent: 'build', messages: [] });

    expect(lines).toContain('CodexAgentTeams v0.1.0');
    expect(lines).toContain('Agent: build');
    expect(lines.at(-1)).toBe('> _');
  });

  it('renders chat messages in order', () => {
    const lines = renderAppToLines({
      activeAgent: 'plan',
      messages: [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi there' }
      ],
      teamDisplayLines: ['Team: review-team', '- security-reviewer (worker-1): busy']
    });

    expect(lines).toContain('=== Team Status ===');
    expect(lines).toContain('Team: review-team');
    expect(lines).toContain('You: hello');
    expect(lines).toContain('Assistant: hi there');
  });
});
