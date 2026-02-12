import { describe, expect, it } from 'vitest';

import { collectTextFromChunks, toChunkStream } from '../../../src/llm/streaming.js';

describe('llm streaming helpers', () => {
  it('collects text from chunk stream in order', async () => {
    async function* chunks() {
      yield { text: 'Hello' };
      yield { text: ' world' };
    }

    await expect(collectTextFromChunks(chunks())).resolves.toBe('Hello world');
  });

  it('wraps text stream into chunk stream', async () => {
    async function* textStream() {
      yield 'A';
      yield 'B';
      yield 'C';
    }

    const result: string[] = [];
    for await (const chunk of toChunkStream(textStream())) {
      result.push(chunk.text);
    }

    expect(result).toEqual(['A', 'B', 'C']);
  });
});
