import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { SQLiteSessionStore } from '../../../src/session/store.js';
import type { SessionSnapshot } from '../../../src/session/types.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagentteams-session-store-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

function createSnapshot(id: string, now: number): SessionSnapshot {
  return {
    id,
    activeAgent: 'build',
    createdAt: now,
    updatedAt: now,
    messages: [
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'hi there' }
    ]
  };
}

describe('SQLiteSessionStore', () => {
  it('persists and loads session snapshot', async () => {
    const dir = await createTempDir();
    const dbPath = join(dir, 'session.db');
    const store = new SQLiteSessionStore(dbPath);

    const snapshot = createSnapshot('session-1', 123456789);
    store.save(snapshot);

    const loaded = store.load('session-1');
    store.close();

    expect(loaded).toEqual(snapshot);
  });

  it('lists sessions ordered by latest update time', async () => {
    const dir = await createTempDir();
    const dbPath = join(dir, 'session.db');
    const store = new SQLiteSessionStore(dbPath);

    store.save(createSnapshot('session-1', 100));
    store.save(createSnapshot('session-2', 200));

    const listed = store.list(10);
    store.close();

    expect(listed.map((item) => item.id)).toEqual(['session-2', 'session-1']);
    expect(listed[0]).toMatchObject({ activeAgent: 'build', updatedAt: 200 });
  });
});
