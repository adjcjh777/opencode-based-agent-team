import { describe, expect, it, vi } from 'vitest';

import { MCPManager } from '../../../src/tools/mcp/client.js';
import { ToolRegistry } from '../../../src/tools/registry.js';
import type { MCPServerConfig } from '../../../src/tools/mcp/loader.js';

describe('MCPManager discovery', () => {
  it('discovers tools through transport-specific handlers', async () => {
    const discoverViaStdio = vi.fn(async () => [
      { name: 'read_file', description: 'Read file' },
      { name: 'list_dir', description: 'List directory' }
    ]);
    const discoverViaSse = vi.fn(async () => [{ name: 'search_web', description: 'Search web' }]);

    const manager = new MCPManager({ discoverViaStdio, discoverViaSse });
    const servers: MCPServerConfig[] = [
      {
        id: 'filesystem',
        transport: 'stdio',
        command: 'npx'
      },
      {
        id: 'search',
        transport: 'sse',
        url: 'https://example.com/mcp/sse'
      }
    ];

    await manager.loadServers(servers);

    const fileTools = await manager.discoverTools('filesystem');
    const searchTools = await manager.discoverTools('search');

    expect(fileTools.map((tool) => tool.name)).toEqual(['read_file', 'list_dir']);
    expect(searchTools.map((tool) => tool.name)).toEqual(['search_web']);
    expect(discoverViaStdio).toHaveBeenCalledTimes(1);
    expect(discoverViaSse).toHaveBeenCalledTimes(1);
  });

  it('registers discovered tools into tool registry with invocation proxy', async () => {
    const discoverViaStdio = vi.fn(async () => [{ name: 'read_file', description: 'Read file' }]);
    const invokeTool = vi.fn(async () => ({ ok: true, data: 'from mcp' }));

    const manager = new MCPManager({ discoverViaStdio, invokeTool });
    await manager.loadServers([
      {
        id: 'filesystem',
        transport: 'stdio',
        command: 'npx'
      }
    ]);

    await manager.discoverTools('filesystem');

    const registry = new ToolRegistry();
    const registered = manager.registerDiscoveredTools('filesystem', registry);

    expect(registered).toBe(1);

    const tool = registry.get('mcp_filesystem_read_file');
    expect(tool).toBeDefined();

    const result = await tool?.execute({ path: 'README.md' });
    expect(result).toEqual({ ok: true, data: 'from mcp' });
    expect(invokeTool).toHaveBeenCalledWith('filesystem', 'read_file', { path: 'README.md' });
  });
});
