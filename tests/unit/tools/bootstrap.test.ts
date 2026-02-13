import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CodexConfig } from '../../../src/core/config.js';
import { createToolRuntime } from '../../../src/tools/bootstrap.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagenttools-bootstrap-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

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

  it('executes allowed tools and blocks denied tools', async () => {
    const manager = {
      loadServers: vi.fn(async () => undefined),
      connect: vi.fn(async () => undefined),
      discoverTools: vi.fn(async () => []),
      registerDiscoveredTools: vi.fn(() => 0)
    };
    const dir = await createTempDir();
    const filePath = join(dir, 'sample.txt');
    await writeFile(filePath, 'hello');

    const runtime = await createToolRuntime(
      {
        ...createBaseConfig(),
        tools: {
          permissions: {
            read: 'allow',
            list: 'deny'
          }
        }
      },
      { manager }
    );

    await expect(runtime.execute('read', { path: filePath })).resolves.toEqual({ content: 'hello' });
    await expect(runtime.execute('list', { path: dir })).rejects.toThrow('Tool permission denied: list');
  });

  it('delegates ask-level permission decisions to askPermission callback', async () => {
    const manager = {
      loadServers: vi.fn(async () => undefined),
      connect: vi.fn(async () => undefined),
      discoverTools: vi.fn(async () => []),
      registerDiscoveredTools: vi.fn(() => 0)
    };
    const askPermission = vi.fn(async () => true);
    const dir = await createTempDir();
    const filePath = join(dir, 'ask.txt');
    await writeFile(filePath, 'allow-through-ask');

    const runtime = await createToolRuntime(
      {
        ...createBaseConfig(),
        tools: {
          permissions: {
            read: 'ask'
          }
        }
      },
      {
        manager,
        askPermission
      }
    );

    await expect(runtime.execute('read', { path: filePath })).resolves.toEqual({
      content: 'allow-through-ask'
    });
    expect(askPermission).toHaveBeenCalledWith('read', { path: filePath });
  });
});
