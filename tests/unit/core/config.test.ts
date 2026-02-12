import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { loadConfig } from '../../../src/core/config.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagentteams-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('loadConfig', () => {
  it('loads codex.config.json from working directory', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'codex.config.json');
    await writeFile(
      filePath,
      JSON.stringify({
        provider: {
          type: 'right-codes',
          baseUrl: 'https://example.right.codes/v1',
          apiKey: 'test-key',
          defaultModel: 'claude-sonnet-4'
        },
        models: {
          primary: 'claude-sonnet-4',
          fast: 'claude-haiku-4',
          reasoning: 'claude-opus-4'
        }
      })
    );

    const config = await loadConfig({ cwd: dir });

    expect(config.provider.type).toBe('right-codes');
    expect(config.provider.baseUrl).toBe('https://example.right.codes/v1');
    expect(config.models.primary).toBe('claude-sonnet-4');
  });

  it('falls back to environment variables for right.codes credentials', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'codex.config.json');
    await writeFile(
      filePath,
      JSON.stringify({
        provider: {
          type: 'right-codes',
          defaultModel: 'claude-sonnet-4'
        },
        models: {
          primary: 'claude-sonnet-4',
          fast: 'claude-haiku-4',
          reasoning: 'claude-opus-4'
        }
      })
    );

    const config = await loadConfig({
      cwd: dir,
      env: {
        RC_API_KEY: 'env-key',
        RC_BASE_URL: 'https://env.right.codes/v1'
      }
    });

    expect(config.provider.apiKey).toBe('env-key');
    expect(config.provider.baseUrl).toBe('https://env.right.codes/v1');
  });

  it('throws a helpful error when required provider fields are missing', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'codex.config.json');
    await writeFile(
      filePath,
      JSON.stringify({
        provider: {
          type: 'right-codes'
        },
        models: {
          primary: 'claude-sonnet-4',
          fast: 'claude-haiku-4',
          reasoning: 'claude-opus-4'
        }
      })
    );

    await expect(loadConfig({ cwd: dir, env: {} })).rejects.toThrow(
      'Missing right.codes credentials'
    );
  });
});
