import { describe, expect, it } from 'vitest';

import { mapMcpToolsToRegistry } from '../../../src/tools/mcp/registry.js';

describe('mapMcpToolsToRegistry', () => {
  it('maps mcp tools into normalized names', () => {
    const mapped = mapMcpToolsToRegistry('filesystem', [
      {
        name: 'read_file',
        description: 'Read file through mcp'
      },
      {
        name: 'list_dir',
        description: 'List dir through mcp'
      }
    ]);

    expect(mapped).toEqual([
      {
        name: 'mcp_filesystem_read_file',
        description: 'Read file through mcp',
        sourceServer: 'filesystem',
        sourceTool: 'read_file'
      },
      {
        name: 'mcp_filesystem_list_dir',
        description: 'List dir through mcp',
        sourceServer: 'filesystem',
        sourceTool: 'list_dir'
      }
    ]);
  });
});
