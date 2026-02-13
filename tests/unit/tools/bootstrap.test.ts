import { describe, expect, it, vi } from 'vitest';

import type { CodexConfig } from '../../../src/core/config.js';
import { createToolRuntime } from '../../../src/tools/bootstrap.js';

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

describe('createToolRuntime', () => {
  it('registers built-in tools and bootstraps mcp', async () => {
    const manager = {
      loadServers: vi.fn(async () => undefined),
      connect: vi.fn(async () => undefined),
      discoverTools: vi.fn(async () => []),
      registerDiscoveredTools: vi.fn(() => 0)
    };

    const runtime = await createToolRuntime(createBaseConfig(), { manager });

    expect(runtime.registry.list().map((tool) => tool.name)).toEqual([
      'read',
      'write',
      'edit',
      'list',
      'glob',
      'grep',
      'bash',
      'webfetch',
      'websearch',
      'patch'
    ]);

    expect(runtime.mcp).toEqual({
      serversLoaded: 0,
      toolsRegistered: 0,
      serverIds: []
    });
    expect(manager.loadServers).toHaveBeenCalledWith([]);
  });

  it('supports mcp-discovered tools during bootstrap', async () => {
    const manager = {
      loadServers: vi.fn(async () => undefined),
      connect: vi.fn(async () => undefined),
      discoverTools: vi.fn(async () => []),
      registerDiscoveredTools: vi.fn((serverId: string, registry: { register: (tool: any) => void }) => {
        registry.register({
          name: `mcp_${serverId}_ping`,
          description: 'Ping',
          execute: async () => ({ ok: true })
        });

        return 1;
      })
    };

    const runtime = await createToolRuntime(
      {
        ...createBaseConfig(),
        mcp: {
          servers: [
            {
              id: 'test',
              transport: 'stdio',
              command: 'npx'
            }
          ]
        }
      },
      { manager }
    );

    expect(runtime.registry.get('mcp_test_ping')).toBeDefined();
    expect(runtime.mcp.toolsRegistered).toBe(1);
    expect(runtime.mcp.serverIds).toEqual(['test']);
  });
});
