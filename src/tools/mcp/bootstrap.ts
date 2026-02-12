import type { CodexConfig } from '../../core/config.js';
import type { ToolRegistry } from '../registry.js';
import { extractMcpServerConfigs } from './loader.js';

interface MCPBootstrapManager {
  loadServers(configs: ReturnType<typeof extractMcpServerConfigs>): Promise<void>;
  connect(serverId: string): Promise<void>;
  discoverTools(serverId: string): Promise<unknown>;
  registerDiscoveredTools(serverId: string, registry: ToolRegistry): number;
}

export interface MCPBootstrapResult {
  serversLoaded: number;
  toolsRegistered: number;
  serverIds: string[];
}

export async function bootstrapMcpTools(
  config: CodexConfig,
  manager: MCPBootstrapManager,
  registry: ToolRegistry
): Promise<MCPBootstrapResult> {
  const servers = extractMcpServerConfigs(config);
  await manager.loadServers(servers);

  let toolsRegistered = 0;
  const serverIds: string[] = [];

  for (const server of servers) {
    serverIds.push(server.id);
    await manager.connect(server.id);
    await manager.discoverTools(server.id);
    toolsRegistered += manager.registerDiscoveredTools(server.id, registry);
  }

  return {
    serversLoaded: servers.length,
    toolsRegistered,
    serverIds
  };
}
