import { describe, expect, it, vi } from 'vitest';

import { CoreEngine } from '../../../src/core/engine.js';
import type { LLMAdapter } from '../../../src/llm/adapter.js';
import { SessionManager } from '../../../src/session/manager.js';

describe('CoreEngine', () => {
  it('runs one chat turn and records response in session', async () => {
    const adapter = {
      chat: vi.fn(async function* () {
        yield { text: 'Hello' };
        yield { text: ' world' };
      })
    } as unknown as LLMAdapter;

    const engine = new CoreEngine({ adapter, retries: 0 });
    const result = await engine.runTurn('Hi');

    expect(result.assistant).toBe('Hello world');
    expect(result.messages).toEqual([
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello world' }
    ]);
  });

  it('uses provided session instance', async () => {
    const adapter = {
      chat: vi.fn(async function* () {
        yield { text: 'ok' };
      })
    } as unknown as LLMAdapter;

    const session = new SessionManager({ activeAgent: 'plan' });
    const engine = new CoreEngine({ adapter, session });

    await engine.runTurn('question');

    expect(engine.getSession()).toBe(session);
    expect(engine.getSession().getActiveAgent()).toBe('plan');
  });
});
