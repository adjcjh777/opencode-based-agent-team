import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import type { SessionSnapshot, SessionStore } from './types.js';

function parseSessionSnapshot(raw: string): SessionSnapshot {
  return JSON.parse(raw) as SessionSnapshot;
}

export class SQLiteSessionStore implements SessionStore {
  private readonly db: DatabaseSync;

  constructor(dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        active_agent TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        payload TEXT NOT NULL
      );
    `);
  }

  save(snapshot: SessionSnapshot): void {
    const statement = this.db.prepare(`
      INSERT INTO sessions (id, active_agent, created_at, updated_at, payload)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        active_agent = excluded.active_agent,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at,
        payload = excluded.payload;
    `);

    statement.run(
      snapshot.id,
      snapshot.activeAgent,
      snapshot.createdAt,
      snapshot.updatedAt,
      JSON.stringify(snapshot)
    );
  }

  load(id: string): SessionSnapshot | undefined {
    const statement = this.db.prepare('SELECT payload FROM sessions WHERE id = ? LIMIT 1;');
    const row = statement.get(id) as { payload: string } | undefined;
    if (!row) {
      return undefined;
    }

    return parseSessionSnapshot(row.payload);
  }

  list(limit = 20): SessionSnapshot[] {
    const statement = this.db.prepare(
      'SELECT payload FROM sessions ORDER BY updated_at DESC LIMIT ?;'
    );
    const rows = statement.all(limit) as { payload: string }[];
    return rows.map((row) => parseSessionSnapshot(row.payload));
  }

  close(): void {
    this.db.close();
  }
}
