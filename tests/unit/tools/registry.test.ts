import { describe, expect, it } from 'vitest';

import { ToolRegistry } from '../../../src/tools/registry.js';
import type { ToolDefinition } from '../../../src/tools/types.js';

const readTool: ToolDefinition<{ path: string }, { content: string }> = {
  name: 'read',
  description: 'Read file content',
  execute: async ({ path }) => ({ content: `file:${path}` })
};

const listTool: ToolDefinition<{ path: string }, { entries: string[] }> = {
  name: 'list',
  description: 'List directory entries',
  execute: async ({ path }) => ({ entries: [path] })
};

describe('ToolRegistry', () => {
  it('registers and retrieves tool by name', () => {
    const registry = new ToolRegistry();

    registry.register(readTool);

    expect(registry.get('read')?.description).toBe('Read file content');
    expect(registry.get('missing')).toBeUndefined();
  });

  it('lists tools in registration order', () => {
    const registry = new ToolRegistry();

    registry.register(readTool);
    registry.register(listTool);

    expect(registry.list().map((tool) => tool.name)).toEqual(['read', 'list']);
  });

  it('rejects duplicate registration by tool name', () => {
    const registry = new ToolRegistry();

    registry.register(readTool);

    expect(() => registry.register(readTool)).toThrow('Tool already registered: read');
  });
});
