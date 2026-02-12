import { describe, expect, it, vi } from 'vitest';

import { SessionHistory } from '../../../src/session/history.js';
import type { SessionSnapshot, SessionStore } from '../../../src/session/types.js';

function createSnapshot(id: string, updatedAt: number): SessionSnapshot {
  return {
    id,
    activeAgent: 'build',
    createdAt: updatedAt,
    updatedAt,
    messages: []
  };
}

describe('SessionHistory', () => {
  it('lists recent sessions from store', () => {
    const snapshots = [createSnapshot('s2', 200), createSnapshot('s1', 100)];
    const store: SessionStore = {
      save: vi.fn(),
      load: vi.fn(),
      list: vi.fn(() => snapshots)
    };

    const history = new SessionHistory(store);
    const listed = history.listRecent(5);

    expect(listed).toEqual(snapshots);
    expect(store.list).toHaveBeenCalledWith(5);
  });

  it('loads a single session snapshot by id', () => {
    const snapshot = createSnapshot('s1', 100);
    const store: SessionStore = {
      save: vi.fn(),
      load: vi.fn((id: string) => (id === 's1' ? snapshot : undefined)),
      list: vi.fn(() => [snapshot])
    };

    const history = new SessionHistory(store);

    expect(history.getSession('s1')).toEqual(snapshot);
    expect(history.getSession('missing')).toBeUndefined();
  });
});
