import { describe, expect, it, vi } from 'vitest';

import { runSingleTurnChatLoop } from '../../../src/core/chat-loop.js';
import { SessionManager } from '../../../src/session/manager.js';
import type { LLMAdapter } from '../../../src/llm/adapter.js';

describe('runSingleTurnChatLoop', () => {
  it('stores user input and streamed assistant output into session', async () => {
    const session = new SessionManager();

    const chat = vi.fn(async function* () {
      yield { text: 'Hello' };
      yield { text: ' world' };
    });

    const adapter = {
      chat
    } as unknown as LLMAdapter;

    const output = await runSingleTurnChatLoop({
      session,
      adapter,
      userInput: 'Hi'
    });

    expect(output).toBe('Hello world');
    expect(session.getMessages()).toEqual([
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello world' }
    ]);
    expect(chat).toHaveBeenCalledTimes(1);
  });
});
