import { describe, expect, it } from 'vitest';

import { SessionManager } from '../../../src/session/manager.js';

describe('SessionManager', () => {
  it('records messages in order', () => {
    const manager = new SessionManager();

    manager.addUserMessage('hello');
    manager.addAssistantMessage('hi there');

    expect(manager.getMessages()).toEqual([
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'hi there' }
    ]);
  });

  it('exposes active agent for the current session', () => {
    const manager = new SessionManager({ activeAgent: 'plan' });

    expect(manager.getActiveAgent()).toBe('plan');
  });
});
