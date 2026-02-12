import type { MCPServerConfig } from './loader.js';
import type { ToolRegistry } from '../registry.js';
import type { ToolDefinition } from '../types.js';
import { mapMcpToolsToRegistry, type MCPDiscoveredTool } from './registry.js';

export type MCPConnectionStatus = 'connected' | 'disconnected';

interface MCPServerState {
  config: MCPServerConfig;
  status: MCPConnectionStatus;
  discoveredTools: MCPDiscoveredTool[];
}

interface MCPManagerDeps {
  discoverViaStdio?: (config: Extract<MCPServerConfig, { transport: 'stdio' }>) => Promise<MCPDiscoveredTool[]>;
  discoverViaSse?: (config: Extract<MCPServerConfig, { transport: 'sse' }>) => Promise<MCPDiscoveredTool[]>;
  invokeTool?: (serverId: string, toolName: string, args: unknown) => Promise<unknown>;
}

export class MCPManager {
  private readonly servers = new Map<string, MCPServerState>();

  constructor(private readonly deps: MCPManagerDeps = {}) {}

  async loadServers(configs: MCPServerConfig[]): Promise<void> {
    this.servers.clear();
    for (const config of configs) {
      this.servers.set(config.id, {
        config,
        status: 'disconnected',
        discoveredTools: []
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

  async discoverTools(serverId: string): Promise<MCPDiscoveredTool[]> {
    const state = this.servers.get(serverId);
    if (!state) {
      throw new Error(`Unknown MCP server: ${serverId}`);
    }

    let discovered: MCPDiscoveredTool[] = [];
    if (state.config.transport === 'stdio') {
      discovered =
        (await this.deps.discoverViaStdio?.(state.config as Extract<MCPServerConfig, { transport: 'stdio' }>)) ?? [];
    } else {
      discovered =
        (await this.deps.discoverViaSse?.(state.config as Extract<MCPServerConfig, { transport: 'sse' }>)) ?? [];
    }

    state.discoveredTools = discovered;
    return [...discovered];
  }

  registerDiscoveredTools(serverId: string, registry: ToolRegistry): number {
    const state = this.servers.get(serverId);
    if (!state) {
      throw new Error(`Unknown MCP server: ${serverId}`);
    }

    const mappedTools = mapMcpToolsToRegistry(serverId, state.discoveredTools);
    for (const mapped of mappedTools) {
      const definition: ToolDefinition<unknown, unknown> = {
        name: mapped.name,
        description: mapped.description,
        execute: async (args) => {
          if (!this.deps.invokeTool) {
            throw new Error('MCP invoke handler is not configured.');
          }

          return this.deps.invokeTool(mapped.sourceServer, mapped.sourceTool, args);
        }
      };

      registry.register(definition);
    }

    return mappedTools.length;
  }
}
