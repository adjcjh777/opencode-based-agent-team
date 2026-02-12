import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createPatchTool } from '../../../src/tools/builtin/patch.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagent-patch-tool-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('patch tool', () => {
  it('applies line-based replacement patch to file', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'app.ts');
    await writeFile(filePath, 'const value = 1;\nconsole.log(value);\n', 'utf8');

    const patchTool = createPatchTool();
    const result = await patchTool.execute({
      path: filePath,
      replacements: [{ from: 'const value = 1;', to: 'const value = 2;' }]
    });

    const updated = await readFile(filePath, 'utf8');

    expect(result.updated).toBe(true);
    expect(result.applied).toBe(1);
    expect(updated).toContain('const value = 2;');
  });

  it('throws when strict mode has unmatched replacement', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'app.ts');
    await writeFile(filePath, 'const value = 1;\n', 'utf8');

    const patchTool = createPatchTool();

    await expect(
      patchTool.execute({
        path: filePath,
        replacements: [{ from: 'missing', to: 'value' }],
        strict: true
      })
    ).rejects.toThrow('Patch replacement not found');
  });
});
