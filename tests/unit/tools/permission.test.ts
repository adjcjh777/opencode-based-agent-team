import { describe, expect, it, vi } from 'vitest';

import { PermissionManager } from '../../../src/tools/permission.js';

describe('PermissionManager', () => {
  it('allows tools explicitly marked as allow', async () => {
    const manager = new PermissionManager({
      read: 'allow'
    });

    await expect(manager.check('read', {})).resolves.toBe(true);
  });

  it('denies tools explicitly marked as deny', async () => {
    const manager = new PermissionManager({
      write: 'deny'
    });

    await expect(manager.check('write', {})).resolves.toBe(false);
  });

  it('uses ask callback when level is ask', async () => {
    const ask = vi.fn(async () => true);
    const manager = new PermissionManager(
      {
        bash: 'ask'
      },
      ask
    );

    const result = await manager.check('bash', { command: 'echo 1' });

    expect(result).toBe(true);
    expect(ask).toHaveBeenCalledWith('bash', { command: 'echo 1' });
  });

  it('falls back to deny when tool permission is not configured', async () => {
    const manager = new PermissionManager({});

    await expect(manager.check('unknown-tool', {})).resolves.toBe(false);
  });

  it('supports wildcard patterns like mcp_*', async () => {
    const manager = new PermissionManager({
      'mcp_*': 'allow'
    });

    await expect(manager.check('mcp_filesystem_read_file', {})).resolves.toBe(true);
  });

  it('prefers exact match over wildcard pattern', async () => {
    const manager = new PermissionManager({
      'mcp_*': 'allow',
      mcp_filesystem_delete_file: 'deny'
    });

    await expect(manager.check('mcp_filesystem_delete_file', {})).resolves.toBe(false);
    await expect(manager.check('mcp_filesystem_read_file', {})).resolves.toBe(true);
  });
});
