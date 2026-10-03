import type { AsyncSqliteDatabase } from './types';

export const DATABASE_VERSION = 1;

export async function inTransaction<T>(database: AsyncSqliteDatabase, work: () => Promise<T>): Promise<T> {
  await database.execAsync('BEGIN IMMEDIATE');
  try {
    const result = await work();
    await database.execAsync('COMMIT');
    return result;
  } catch (error) {
    try { await database.execAsync('ROLLBACK'); } catch { /* Preserve the original write failure. */ }
    throw error;
  }
}

const migrations: Record<number, string> = {
  1: `
    CREATE TABLE diary_records (
      id TEXT PRIMARY KEY NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('food','bowel','symptom','water','exercise','sleep')),
      occurred_at TEXT NOT NULL,
      local_date TEXT NOT NULL,
      time_zone TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      schema_version INTEGER NOT NULL CHECK (schema_version = 1),
      details_json TEXT NOT NULL
    );
    CREATE INDEX diary_records_by_date ON diary_records (local_date, occurred_at);
    CREATE TABLE app_settings (
      id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
      language TEXT NOT NULL CHECK (language IN ('en','fi','zh')),
      appearance TEXT NOT NULL CHECK (appearance IN ('light','dark','system'))
    );
    INSERT INTO app_settings (id, language, appearance) VALUES (1, 'en', 'system');
  `,
};

export async function migrateDatabase(database: AsyncSqliteDatabase): Promise<void> {
  await database.execAsync('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;');
  const version = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if (!version || !Number.isInteger(version.user_version) || version.user_version < 0) throw new Error('Invalid database version');
  if (version.user_version > DATABASE_VERSION) throw new Error('This database requires a newer app version');
  if (version.user_version === DATABASE_VERSION) return;
  await inTransaction(database, async () => {
    for (let next = version.user_version + 1; next <= DATABASE_VERSION; next += 1) {
      await database.execAsync(migrations[next]);
      await database.execAsync(`PRAGMA user_version = ${next}`);
    }
  });
}
