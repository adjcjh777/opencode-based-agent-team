import { describe, expect, it, vi } from 'vitest';

import type { CodexConfig } from '../../../src/core/config.js';
import { bootstrapMcpTools } from '../../../src/tools/mcp/bootstrap.js';
import { ToolRegistry } from '../../../src/tools/registry.js';

function createBaseConfig(): CodexConfig {
  return {
    provider: {
      type: 'right-codes',
      apiKey: 'rc-key',
      baseUrl: 'https://example.com/v1'
    },
    models: {
      primary: 'model-primary',
      fast: 'model-fast',
      reasoning: 'model-reasoning'
    }
  };
}

describe('bootstrapMcpTools', () => {
  it('returns zero when no mcp servers are configured', async () => {
    const manager = {
      loadServers: vi.fn(async () => undefined),
      connect: vi.fn(async () => undefined),
      discoverTools: vi.fn(async () => []),
      registerDiscoveredTools: vi.fn(() => 0)
    };

    const registry = new ToolRegistry();
    const result = await bootstrapMcpTools(createBaseConfig(), manager, registry);

    expect(result).toEqual({ serversLoaded: 0, toolsRegistered: 0, serverIds: [] });
    expect(manager.loadServers).toHaveBeenCalledWith([]);
    expect(manager.connect).not.toHaveBeenCalled();
    expect(manager.discoverTools).not.toHaveBeenCalled();
    expect(manager.registerDiscoveredTools).not.toHaveBeenCalled();
  });

  it('loads, discovers, and registers tools for all configured servers', async () => {
    const manager = {
      loadServers: vi.fn(async () => undefined),
      connect: vi.fn(async () => undefined),
      discoverTools: vi.fn(async () => []),
      registerDiscoveredTools: vi.fn().mockReturnValueOnce(2).mockReturnValueOnce(1)
    };

    const registry = new ToolRegistry();
    const config: CodexConfig = {
      ...createBaseConfig(),
      mcp: {
        servers: [
          {
            id: 'filesystem',
            transport: 'stdio',
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem']
          },
          {
            id: 'search',
            transport: 'sse',
            url: 'https://example.com/mcp/sse'
          }
        ]
      }
    };

    const result = await bootstrapMcpTools(config, manager, registry);

    expect(result).toEqual({
      serversLoaded: 2,
      toolsRegistered: 3,
      serverIds: ['filesystem', 'search']
    });
    expect(manager.loadServers).toHaveBeenCalledTimes(1);
    expect(manager.connect).toHaveBeenCalledTimes(2);
    expect(manager.connect).toHaveBeenNthCalledWith(1, 'filesystem');
    expect(manager.connect).toHaveBeenNthCalledWith(2, 'search');
    expect(manager.discoverTools).toHaveBeenNthCalledWith(1, 'filesystem');
    expect(manager.discoverTools).toHaveBeenNthCalledWith(2, 'search');
    expect(manager.registerDiscoveredTools).toHaveBeenNthCalledWith(1, 'filesystem', registry);
    expect(manager.registerDiscoveredTools).toHaveBeenNthCalledWith(2, 'search', registry);
  });
});
