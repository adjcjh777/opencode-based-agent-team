import type { ToolDefinition } from './types.js';

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition<any, any>>();

  register(tool: ToolDefinition<any, any>): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }

    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition<any, any> | undefined {
    return this.tools.get(name);
  }

  list(): ToolDefinition<any, any>[] {
    return [...this.tools.values()];
  }
}
