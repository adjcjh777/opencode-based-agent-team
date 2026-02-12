import { describe, expect, it, vi } from 'vitest';

import { runSingleTurnChatLoop } from '../../../src/core/chat-loop.js';
import { SessionManager } from '../../../src/session/manager.js';
import type { LLMAdapter } from '../../../src/llm/adapter.js';
import { createLogger } from '../../../src/core/logger.js';

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

  it('retries adapter chat when transient failure occurs', async () => {
    const session = new SessionManager();

    let calls = 0;
    const chat = vi.fn(async function* () {
      calls += 1;
      if (calls === 1) {
        throw new Error('temporary outage');
      }

      yield { text: 'Recovered' };
    });

    const logs: string[] = [];
    const logger = createLogger({
      level: 'debug',
      sink: (line) => {
        logs.push(line);
      }
    });

    const adapter = {
      chat
    } as unknown as LLMAdapter;

    const output = await runSingleTurnChatLoop({
      session,
      adapter,
      userInput: 'Hi',
      retries: 1,
      logger
    });

    expect(output).toBe('Recovered');
    expect(chat).toHaveBeenCalledTimes(2);
    expect(logs.some((line) => line.includes('Retrying chat loop'))).toBe(true);
  });
});
