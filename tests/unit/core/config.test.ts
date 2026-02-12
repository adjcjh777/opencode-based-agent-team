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

    expect(config.provider).toMatchObject({
      type: 'right-codes',
      baseUrl: 'https://example.right.codes/v1'
    });
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

    expect(config.provider).toMatchObject({
      type: 'right-codes',
      apiKey: 'env-key',
      baseUrl: 'https://env.right.codes/v1'
    });
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

  it('loads anthropic provider config with env fallback', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'codex.config.json');
    await writeFile(
      filePath,
      JSON.stringify({
        provider: {
          type: 'anthropic',
          apiKey: '${ANTHROPIC_API_KEY}',
          defaultModel: 'claude-3-7-sonnet-latest'
        },
        models: {
          primary: 'claude-3-7-sonnet-latest',
          fast: 'claude-3-5-haiku-latest',
          reasoning: 'claude-3-7-sonnet-latest'
        }
      })
    );

    const config = await loadConfig({
      cwd: dir,
      env: {
        ANTHROPIC_API_KEY: 'anthropic-env-key'
      }
    });

    expect(config.provider).toMatchObject({
      type: 'anthropic',
      apiKey: 'anthropic-env-key'
    });
  });

  it('loads ollama provider with default local base url', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'codex.config.json');
    await writeFile(
      filePath,
      JSON.stringify({
        provider: {
          type: 'ollama',
          defaultModel: 'qwen2.5-coder:latest'
        },
        models: {
          primary: 'qwen2.5-coder:latest',
          fast: 'qwen2.5:latest',
          reasoning: 'qwen2.5-coder:latest'
        }
      })
    );

    const config = await loadConfig({ cwd: dir, env: {} });

    expect(config.provider).toMatchObject({
      type: 'ollama',
      baseUrl: 'http://localhost:11434/v1'
    });
  });

  it('loads openai-compatible provider with env fallback', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'codex.config.json');
    await writeFile(
      filePath,
      JSON.stringify({
        provider: {
          type: 'openai-compatible',
          apiKey: '${OPENAI_COMPAT_API_KEY}',
          baseUrl: '${OPENAI_COMPAT_BASE_URL}',
          defaultModel: 'gpt-4o'
        },
        models: {
          primary: 'gpt-4o',
          fast: 'gpt-4o-mini',
          reasoning: 'o3-mini'
        }
      })
    );

    const config = await loadConfig({
      cwd: dir,
      env: {
        OPENAI_COMPAT_API_KEY: 'compat-env-key',
        OPENAI_COMPAT_BASE_URL: 'https://proxy.example.com/v1'
      }
    });

    expect(config.provider).toMatchObject({
      type: 'openai-compatible',
      apiKey: 'compat-env-key',
      baseUrl: 'https://proxy.example.com/v1'
    });
  });

  it('loads google provider config with env fallback', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'codex.config.json');
    await writeFile(
      filePath,
      JSON.stringify({
        provider: {
          type: 'google',
          apiKey: '${GOOGLE_API_KEY}',
          defaultModel: 'gemini-2.0-flash'
        },
        models: {
          primary: 'gemini-2.0-flash',
          fast: 'gemini-2.0-flash-lite',
          reasoning: 'gemini-2.0-pro'
        }
      })
    );

    const config = await loadConfig({
      cwd: dir,
      env: {
        GOOGLE_API_KEY: 'google-env-key'
      }
    });

    expect(config.provider).toMatchObject({
      type: 'google',
      apiKey: 'google-env-key'
    });
  });
});
