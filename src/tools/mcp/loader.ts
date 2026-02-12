import type { CodexConfig } from '../../core/config.js';

export type MCPServerConfig =
  | {
      id: string;
      transport: 'stdio';
      command: string;
      args?: string[];
    }
  | {
      id: string;
      transport: 'sse';
      url: string;
    };

export function extractMcpServerConfigs(config: Partial<CodexConfig> & { mcp?: unknown }): MCPServerConfig[] {
  if (!config.mcp || typeof config.mcp !== 'object') {
    return [];
  }

  const mcpObject = config.mcp as { servers?: unknown };
  if (!Array.isArray(mcpObject.servers)) {
    return [];
  }

  const servers: MCPServerConfig[] = [];

  for (const server of mcpObject.servers) {
    if (!server || typeof server !== 'object') {
      continue;
    }

    const item = server as Record<string, unknown>;

    if (item.transport === 'stdio' && typeof item.id === 'string' && typeof item.command === 'string') {
      servers.push({
        id: item.id,
        transport: 'stdio',
        command: item.command,
        args: Array.isArray(item.args) ? item.args.filter((arg): arg is string => typeof arg === 'string') : undefined
      });
      continue;
    }

    if (item.transport === 'sse' && typeof item.id === 'string' && typeof item.url === 'string') {
      servers.push({
        id: item.id,
        transport: 'sse',
        url: item.url
      });
    }
  }

  return servers;
}
