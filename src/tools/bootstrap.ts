import type { CodexConfig } from '../core/config.js';
import { createBashTool } from './builtin/bash.js';
import { createEditTool } from './builtin/edit.js';
import { createGlobTool } from './builtin/glob.js';
import { createGrepTool } from './builtin/grep.js';
import { createListTool } from './builtin/list.js';
import { createPatchTool } from './builtin/patch.js';
import { createReadTool } from './builtin/read.js';
import { createWebFetchTool } from './builtin/web-fetch.js';
import { createWebSearchTool } from './builtin/web-search.js';
import { createWriteTool } from './builtin/write.js';
import { MCPManager } from './mcp/client.js';
import { bootstrapMcpTools, type MCPBootstrapManager, type MCPBootstrapResult } from './mcp/bootstrap.js';
import { PermissionManager } from './permission.js';
import { ToolRegistry } from './registry.js';
import type { ToolExecutionContext } from './types.js';

export interface ToolRuntime {
  registry: ToolRegistry;
  permissions: PermissionManager;
  execute: <TArgs = unknown, TResult = unknown>(
    toolName: string,
    args: TArgs,
    context?: ToolExecutionContext
  ) => Promise<TResult>;
  mcp: MCPBootstrapResult;
}

export interface ToolRuntimeDeps {
  manager?: MCPBootstrapManager;
}

function registerBuiltinTools(registry: ToolRegistry): void {
  registry.register(createReadTool());
  registry.register(createWriteTool());
  registry.register(createEditTool());
  registry.register(createListTool());
  registry.register(createGlobTool());
  registry.register(createGrepTool());
  registry.register(createBashTool());
  registry.register(createWebFetchTool());
  registry.register(createWebSearchTool());
  registry.register(createPatchTool());
}

export async function createToolRuntime(
  config: CodexConfig,
  deps: ToolRuntimeDeps = {}
): Promise<ToolRuntime> {
  const registry = new ToolRegistry();
  const permissions = new PermissionManager(config.tools?.permissions ?? {});
  registerBuiltinTools(registry);

  const manager = deps.manager ?? new MCPManager();
  const mcp = await bootstrapMcpTools(config, manager, registry);

  const execute: ToolRuntime['execute'] = async (toolName, args, context) => {
    const tool = registry.get(toolName);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    const allowed = await permissions.check(toolName, args);
    if (!allowed) {
      throw new Error(`Tool permission denied: ${toolName}`);
    }

    return tool.execute(args, context);
  };

  return {
    registry,
    permissions,
    execute,
    mcp
  };
}
