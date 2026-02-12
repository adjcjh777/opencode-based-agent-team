export interface MCPDiscoveredTool {
  name: string;
  description: string;
}

export interface MCPRegistryTool {
  name: string;
  description: string;
  sourceServer: string;
  sourceTool: string;
}

export function mapMcpToolsToRegistry(
  serverId: string,
  tools: MCPDiscoveredTool[]
): MCPRegistryTool[] {
  return tools.map((tool) => ({
    name: `mcp_${serverId}_${tool.name}`,
    description: tool.description,
    sourceServer: serverId,
    sourceTool: tool.name
  }));
}
