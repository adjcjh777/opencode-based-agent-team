import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createEditTool } from '../../../src/tools/builtin/edit.js';
import { createGlobTool } from '../../../src/tools/builtin/glob.js';
import { createGrepTool } from '../../../src/tools/builtin/grep.js';
import { createListTool } from '../../../src/tools/builtin/list.js';
import { createReadTool } from '../../../src/tools/builtin/read.js';
import { createWriteTool } from '../../../src/tools/builtin/write.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagent-tools-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('builtin file/search tools', () => {
  it('read and write tools roundtrip file content', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'notes.txt');

    const write = createWriteTool();
    await write.execute({ path: filePath, content: 'hello tools' });

    const read = createReadTool();
    const result = await read.execute({ path: filePath });

    expect(result.content).toBe('hello tools');
  });

  it('edit tool replaces text in file', async () => {
    const dir = await createTempDir();
    const filePath = join(dir, 'edit.txt');
    await writeFile(filePath, 'hello world', 'utf8');

    const edit = createEditTool();
    await edit.execute({ path: filePath, search: 'world', replace: 'agent' });

    const content = await readFile(filePath, 'utf8');
    expect(content).toBe('hello agent');
  });

  it('list tool lists directory entries', async () => {
    const dir = await createTempDir();
    await writeFile(join(dir, 'a.txt'), 'A', 'utf8');
    await writeFile(join(dir, 'b.txt'), 'B', 'utf8');

    const list = createListTool();
    const result = await list.execute({ path: dir });

    expect(result.entries).toContain('a.txt');
    expect(result.entries).toContain('b.txt');
  });

  it('glob tool matches file pattern recursively', async () => {
    const dir = await createTempDir();
    await writeFile(join(dir, 'a.ts'), 'A', 'utf8');
    await writeFile(join(dir, 'b.js'), 'B', 'utf8');

    const glob = createGlobTool();
    const result = await glob.execute({ pattern: '**/*.ts', cwd: dir });

    expect(result.matches.some((match) => match.endsWith('a.ts'))).toBe(true);
  });

  it('grep tool finds lines containing pattern', async () => {
    const dir = await createTempDir();
    await writeFile(join(dir, 'grep.txt'), 'alpha\nbeta\nalpha-beta', 'utf8');

    const grep = createGrepTool();
    const result = await grep.execute({ pattern: 'alpha', path: dir });

    expect(result.matches.length).toBeGreaterThanOrEqual(2);
    expect(result.matches[0]).toContain('grep.txt');
  });
});
