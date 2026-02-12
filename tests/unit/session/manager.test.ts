import { describe, expect, it } from 'vitest';

import { SessionManager } from '../../../src/session/manager.js';
import type { SessionStore } from '../../../src/session/types.js';

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

  it('persists session snapshot after message updates when store is provided', () => {
    const saves: unknown[] = [];
    const store: SessionStore = {
      save(snapshot) {
        saves.push(snapshot);
      },
      load() {
        return undefined;
      },
      list() {
        return [];
      }
    };

    const manager = new SessionManager({ id: 'session-1', activeAgent: 'build', now: () => 100 }, store);
    manager.addUserMessage('hello');
    manager.addAssistantMessage('hi there');

    expect(saves.length).toBe(2);
    expect(saves.at(-1)).toMatchObject({
      id: 'session-1',
      activeAgent: 'build',
      updatedAt: 100,
      messages: [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi there' }
      ]
    });
  });
});
