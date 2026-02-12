import type { MCPServerConfig } from './loader.js';

export type MCPConnectionStatus = 'connected' | 'disconnected';

interface MCPServerState {
  config: MCPServerConfig;
  status: MCPConnectionStatus;
}

export class MCPManager {
  private readonly servers = new Map<string, MCPServerState>();

  async loadServers(configs: MCPServerConfig[]): Promise<void> {
    this.servers.clear();
    for (const config of configs) {
      this.servers.set(config.id, {
        config,
        status: 'disconnected'
      });
    }
  }

  listServers(): MCPServerConfig[] {
    return [...this.servers.values()].map((item) => item.config);
  }

  getStatus(serverId: string): MCPConnectionStatus {
    return this.servers.get(serverId)?.status ?? 'disconnected';
  }

  async connect(serverId: string): Promise<void> {
    const state = this.servers.get(serverId);
    if (!state) {
      throw new Error(`Unknown MCP server: ${serverId}`);
    }

    state.status = 'connected';
  }

  async disconnect(serverId: string): Promise<void> {
    const state = this.servers.get(serverId);
    if (!state) {
      return;
    }

    state.status = 'disconnected';
  }
}
