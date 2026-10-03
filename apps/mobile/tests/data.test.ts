import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDiaryRepository } from '../src/data/repositories';
import { DATABASE_VERSION, migrateDatabase } from '../src/data/sqlite/migrations';
import type { AsyncSqliteDatabase } from '../src/data/sqlite/types';
import type { RecordDraft } from '../src/domain/records';
import { createAppStore } from '../src/state/useAppStore';

// Only the driver is adapted. These tests run the production SQL, migrations and repository against SQLite.
function adapter(database: DatabaseSync): AsyncSqliteDatabase {
  return {
    execAsync: async (sql) => { database.exec(sql); },
    runAsync: async (sql, ...params) => {
      const result = database.prepare(sql).run(...params);
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    getFirstAsync: async <T>(sql: string, ...params: (string | number | null)[]) => (database.prepare(sql).get(...params) ?? null) as T | null,
    getAllAsync: async <T>(sql: string, ...params: (string | number | null)[]) => database.prepare(sql).all(...params) as unknown as T[],
  };
}

const draft: RecordDraft = {
  kind: 'bowel', occurredAt: '2026-10-03T10:00:00.000Z', localDate: '2026-10-03', timeZone: 'Europe/Helsinki',
  details: { stoolType: 4, feeling: 'normal', sensations: [], note: '用户备注 / oma teksti' },
};

let database: DatabaseSync;
let driver: AsyncSqliteDatabase;
let sequence: number;
const repository = (databaseDriver = driver) => createDiaryRepository({
  openDatabase: async () => databaseDriver,
  now: () => new Date('2026-10-03T12:00:00.000Z'),
  createId: () => `entry-${++sequence}`,
});

beforeEach(() => { database = new DatabaseSync(':memory:'); driver = adapter(database); sequence = 0; });
afterEach(() => { database.close(); });

describe('SQLite migrations and repository', () => {
  it('migrates once and preserves settings and records on repeated initialization', async () => {
    const repo = repository();
    await Promise.all([repo.initialize(), repo.initialize()]);
    expect(database.prepare('PRAGMA user_version').get()?.user_version).toBe(DATABASE_VERSION);
    expect(await repo.getSettings()).toEqual({ language: 'en', appearance: 'system' });
    const record = await repo.createRecord(draft);
    await repo.updateSettings({ language: 'fi', appearance: 'dark' });
    await migrateDatabase(driver);
    expect(await repo.getRecord(record.id)).toEqual(record);
    expect(await repo.getSettings()).toEqual({ language: 'fi', appearance: 'dark' });
  });

  it('rolls back the entire migration when a statement fails', async () => {
    const failing: AsyncSqliteDatabase = { ...driver, execAsync: async (sql) => {
      if (sql === 'PRAGMA user_version = 1') throw new Error('migration interrupted');
      await driver.execAsync(sql);
    } };
    await expect(migrateDatabase(failing)).rejects.toThrow('migration interrupted');
    expect(database.prepare('PRAGMA user_version').get()?.user_version).toBe(0);
    expect(database.prepare("SELECT name FROM sqlite_master WHERE name = 'diary_records'").get()).toBeUndefined();
    await migrateDatabase(driver);
    expect(database.prepare('PRAGMA user_version').get()?.user_version).toBe(1);
  });

  it('rejects a future database instead of downgrading it', async () => {
    database.exec('PRAGMA user_version = 2');
    await expect(repository().initialize()).rejects.toThrow('newer app');
    expect(database.prepare('PRAGMA user_version').get()?.user_version).toBe(2);
  });

  it('creates, updates, deletes and restores the same record without derived labels', async () => {
    const repo = repository();
    const record = await repo.createRecord(draft);
    expect(await repo.listRecords()).toEqual([record]);
    expect(database.prepare('SELECT details_json FROM diary_records').get()?.details_json).toContain('用户备注');
    expect(record).not.toHaveProperty('title');
    const updated = await repo.updateRecord(record.id, { ...draft, details: { ...draft.details, stoolType: 3 } });
    expect(updated.id).toBe(record.id);
    expect(updated.createdAt).toBe(record.createdAt);
    expect(updated.details).toMatchObject({ stoolType: 3 });
    await repo.deleteRecord(record.id);
    expect(await repo.getRecord(record.id)).toBeNull();
    await repo.restoreRecord(updated);
    expect(await repo.listRecords()).toEqual([updated]);
    await expect(repo.restoreRecord(updated)).rejects.toThrow();
    expect(await repo.listRecords()).toHaveLength(1);
  });

  it('reports missing updates/deletes and rejects safety warnings before an insert', async () => {
    const repo = repository();
    await expect(repo.updateRecord('missing', draft)).rejects.toThrow('not found');
    await expect(repo.deleteRecord('missing')).rejects.toThrow('not found');
    await expect(repo.createRecord({ ...draft, details: { ...draft.details, warnings: ['blood'] } } as unknown as RecordDraft)).rejects.toThrow('Safety warnings');
    expect(await repo.listRecords()).toEqual([]);
  });

  it('orders events by time even when their ISO strings use different offsets', async () => {
    const repo = repository();
    const early = await repo.createRecord({ ...draft, occurredAt: '2026-10-03T12:00:00+03:00' });
    const later = await repo.createRecord({ ...draft, occurredAt: '2026-10-03T10:00:00Z' });
    expect((await repo.listRecords()).map((record) => record.id)).toEqual([later.id, early.id]);
  });

  it('persists records and settings through a real file close and reopen', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'poop-diary-test-'));
    const path = join(directory, 'diary.db');
    let fileDatabase = new DatabaseSync(path);
    try {
      const first = repository(adapter(fileDatabase));
      const record = await first.createRecord(draft);
      await first.updateSettings({ language: 'zh', appearance: 'light' });
      fileDatabase.close();
      fileDatabase = new DatabaseSync(path);
      const reopened = repository(adapter(fileDatabase));
      expect(await reopened.listRecords()).toEqual([record]);
      expect(await reopened.getSettings()).toEqual({ language: 'zh', appearance: 'light' });
    } finally {
      fileDatabase.close();
      for (const suffix of ['', '-wal', '-shm']) rmSync(`${path}${suffix}`, { force: true });
      rmdirSync(directory);
    }
  });
});

describe('store cache after database writes', () => {
  it('shares initialization and can retry an open failure', async () => {
    let fail = true;
    const open = vi.fn(async () => { if (fail) throw new Error('unavailable'); return driver; });
    const store = createAppStore(createDiaryRepository({ openDatabase: open }));
    const first = store.getState().initialize();
    const second = store.getState().initialize();
    expect(first).toBe(second);
    await expect(first).rejects.toThrow('unavailable');
    expect(store.getState()).toMatchObject({ status: 'error', records: [], error: 'unavailable' });
    fail = false;
    await Promise.all([store.getState().initialize(), store.getState().initialize()]);
    expect(open).toHaveBeenCalledTimes(2);
    expect(store.getState()).toMatchObject({ status: 'ready', error: null });
  });

  it('rolls back a failed commit and keeps the create cache unchanged', async () => {
    let failCommit = false;
    const failing = { ...driver, execAsync: async (sql: string) => {
      if (failCommit && sql === 'COMMIT') throw new Error('disk full');
      await driver.execAsync(sql);
    } };
    const store = createAppStore(repository(failing));
    await store.getState().initialize();
    failCommit = true;
    await expect(store.getState().createRecord(draft)).rejects.toThrow('disk full');
    expect(store.getState().records).toEqual([]);
    expect(database.prepare('SELECT count(*) AS count FROM diary_records').get()?.count).toBe(0);
    failCommit = false;
    await store.getState().createRecord(draft);
    expect(store.getState().records).toHaveLength(1);
    expect(store.getState().error).toBeNull();
  });

  it('keeps record and settings caches unchanged on update/delete/settings failures', async () => {
    let failWrites = false;
    const failing: AsyncSqliteDatabase = { ...driver, runAsync: async (sql, ...params) => {
      if (failWrites) throw new Error('write denied');
      return driver.runAsync(sql, ...params);
    } };
    const store = createAppStore(repository(failing));
    const record = await store.getState().createRecord(draft);
    const settings = store.getState().settings;
    failWrites = true;
    await expect(store.getState().updateRecord(record.id, { ...draft, details: { ...draft.details, stoolType: 2 } })).rejects.toThrow('write denied');
    await expect(store.getState().deleteRecord(record.id)).rejects.toThrow('write denied');
    await expect(store.getState().updateSettings({ language: 'fi' })).rejects.toThrow('write denied');
    expect(store.getState().records).toEqual([record]);
    expect(store.getState().settings).toEqual(settings);
    expect(database.prepare('SELECT details_json FROM diary_records').get()?.details_json).toBe(JSON.stringify(record.details));
  });

  it('serializes overlapping writes and persists independent settings patches', async () => {
    const store = createAppStore(repository());
    const create = store.getState().createRecord(draft);
    const update = store.getState().updateRecord('entry-1', { ...draft, details: { ...draft.details, stoolType: 5 } });
    await Promise.all([create, update, store.getState().initialize()]);
    expect(store.getState().records).toHaveLength(1);
    expect(store.getState().records[0].details).toMatchObject({ stoolType: 5 });
    await Promise.all([store.getState().updateSettings({ language: 'fi' }), store.getState().updateSettings({ appearance: 'dark' })]);
    expect(store.getState().settings).toEqual({ language: 'fi', appearance: 'dark' });
    expect(await repository().getSettings()).toEqual(store.getState().settings);
    await store.getState().deleteRecord('entry-1');
    expect(store.getState().records).toEqual([]);
    await store.getState().restoreRecord(await update);
    expect(store.getState().records[0].details).toMatchObject({ stoolType: 5 });
  });
});
