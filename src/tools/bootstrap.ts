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
import { ToolRegistry } from './registry.js';

export interface ToolRuntime {
  registry: ToolRegistry;
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
  registerBuiltinTools(registry);

  const manager = deps.manager ?? new MCPManager();
  const mcp = await bootstrapMcpTools(config, manager, registry);

  return {
    registry,
    mcp
  };
}
