import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { runDoctor } from '../../../src/core/doctor.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagent-doctor-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('runDoctor', () => {
  it('reports pass when required files and config are valid', async () => {
    const cwd = await createTempDir();
    const codexHome = join(cwd, '.codex-home');
    await writeFile(
      join(cwd, 'codex.config.json'),
      JSON.stringify({
        provider: {
          type: 'right-codes',
          apiKey: 'test-key',
          baseUrl: 'https://example.right.codes/v1'
        },
        models: {
          primary: 'claude-sonnet-4',
          fast: 'claude-haiku-4',
          reasoning: 'claude-opus-4'
        }
      })
    );

    const report = await runDoctor({ cwd, codexHome, env: {} });

    expect(report.ok).toBe(true);
    expect(report.checks.find((check) => check.id === 'config-file')?.status).toBe('pass');
    expect(report.checks.find((check) => check.id === 'config-parse')?.status).toBe('pass');
    expect(report.checks.find((check) => check.id === 'codex-home')?.status).toBe('pass');
  });

  it('reports failure when codex.config.json is missing', async () => {
    const cwd = await createTempDir();
    const report = await runDoctor({ cwd, env: {} });

    expect(report.ok).toBe(false);
    expect(report.checks.find((check) => check.id === 'config-file')?.status).toBe('fail');
  });
});

