import { describe, expect, it } from 'vitest';

import { extractMcpServerConfigs } from '../../../src/tools/mcp/loader.js';

describe('extractMcpServerConfigs', () => {
  it('returns empty array when config has no mcp field', () => {
    const result = extractMcpServerConfigs({
      provider: {
        type: 'right-codes',
        apiKey: 'key',
        baseUrl: 'https://example.right.codes/v1'
      },
      models: {
        primary: 'claude-sonnet-4',
        fast: 'claude-haiku-4',
        reasoning: 'claude-opus-4'
      }
    });

    expect(result).toEqual([]);
  });

  it('parses stdio and sse mcp server configs', () => {
    const result = extractMcpServerConfigs({
      provider: {
        type: 'right-codes',
        apiKey: 'key',
        baseUrl: 'https://example.right.codes/v1'
      },
      models: {
        primary: 'claude-sonnet-4',
        fast: 'claude-haiku-4',
        reasoning: 'claude-opus-4'
      },
      mcp: {
        servers: [
          {
            id: 'filesystem',
            transport: 'stdio',
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem', '.']
          },
          {
            id: 'search',
            transport: 'sse',
            url: 'https://example.com/mcp/sse'
          }
        ]
      }
    });

    expect(result).toEqual([
      {
        id: 'filesystem',
        transport: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '.']
      },
      {
        id: 'search',
        transport: 'sse',
        url: 'https://example.com/mcp/sse'
      }
    ]);
  });
});
