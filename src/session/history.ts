import type { SessionSnapshot, SessionStore } from './types.js';

export class SessionHistory {
  constructor(private readonly store: SessionStore) {}

  listRecent(limit = 20): SessionSnapshot[] {
    return this.store.list(limit);
  }

  getSession(id: string): SessionSnapshot | undefined {
    return this.store.load(id);
  }
}
