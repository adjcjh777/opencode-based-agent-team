import type { LLMStreamChunk } from './types.js';

export async function collectTextFromChunks(chunks: AsyncIterable<LLMStreamChunk>): Promise<string> {
  let output = '';
  for await (const chunk of chunks) {
    output += chunk.text;
  }

  return output;
}

export async function* toChunkStream(textStream: AsyncIterable<string>): AsyncIterable<LLMStreamChunk> {
  for await (const text of textStream) {
    yield { text };
  }
}
