import { describe, expect, it } from 'vitest';

import { MCPManager } from '../../../src/tools/mcp/client.js';
import type { MCPServerConfig } from '../../../src/tools/mcp/loader.js';

describe('MCPManager', () => {
  it('stores configured servers and reports connection state', async () => {
    const manager = new MCPManager();
    const servers: MCPServerConfig[] = [
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
    ];

    await manager.loadServers(servers);

    expect(manager.listServers().map((item) => item.id)).toEqual(['filesystem', 'search']);
    expect(manager.getStatus('filesystem')).toBe('disconnected');
  });

  it('connect marks server as connected and disconnect resets state', async () => {
    const manager = new MCPManager();
    await manager.loadServers([
      {
        id: 'filesystem',
        transport: 'stdio',
        command: 'npx'
      }
    ]);

    await manager.connect('filesystem');
    expect(manager.getStatus('filesystem')).toBe('connected');

    await manager.disconnect('filesystem');
    expect(manager.getStatus('filesystem')).toBe('disconnected');
  });
});
