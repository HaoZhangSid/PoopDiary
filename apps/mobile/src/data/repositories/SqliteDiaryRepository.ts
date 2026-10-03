import { validateDiaryRecord, validateRecordDraft, type DiaryRecord, type RecordDraft } from '../../domain/records';
import { validateSettingsPatch, type AppSettings } from '../../domain/settings';
import { openDiaryDatabase } from '../sqlite/database';
import { inTransaction, migrateDatabase } from '../sqlite/migrations';
import type { AsyncSqliteDatabase, DatabaseOpener, SqlValue } from '../sqlite/types';
import type { DiaryRepository } from './DiaryRepository';
import { LocalStorageDiaryRepository } from './LocalStorageDiaryRepository';

interface RecordRow {
  id: string;
  kind: string;
  occurred_at: string;
  local_date: string;
  time_zone: string;
  created_at: string;
  updated_at: string;
  schema_version: number;
  details_json: string;
}

export interface RepositoryOptions {
  openDatabase?: DatabaseOpener;
  now?: () => Date;
  createId?: () => string;
}

function createRecordId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `record_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
}

function fromRow(row: RecordRow): DiaryRecord {
  const record: unknown = {
    id: row.id,
    kind: row.kind,
    occurredAt: row.occurred_at,
    localDate: row.local_date,
    timeZone: row.time_zone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    schemaVersion: row.schema_version,
    details: JSON.parse(row.details_json),
  };
  validateDiaryRecord(record);
  return record;
}

function values(record: DiaryRecord): SqlValue[] {
  return [record.id, record.kind, record.occurredAt, record.localDate, record.timeZone, record.createdAt, record.updatedAt, record.schemaVersion, JSON.stringify(record.details)];
}

const INSERT = `INSERT INTO diary_records
  (id, kind, occurred_at, local_date, time_zone, created_at, updated_at, schema_version, details_json)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

export class SqliteDiaryRepository implements DiaryRepository {
  private database: AsyncSqliteDatabase | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private readonly openDatabase: DatabaseOpener;
  private readonly now: () => Date;
  private readonly createId: () => string;

  constructor(options: RepositoryOptions = {}) {
    this.openDatabase = options.openDatabase ?? openDiaryDatabase;
    this.now = options.now ?? (() => new Date());
    this.createId = options.createId ?? createRecordId;
  }

  // This repository owns its connection; reads also join the queue so they cannot enter another write's transaction.
  private enqueue<T>(work: () => Promise<T>): Promise<T> {
    const result = this.queue.then(work);
    this.queue = result.catch(() => undefined);
    return result;
  }

  private async connection(): Promise<AsyncSqliteDatabase> {
    if (!this.database) {
      const database = await this.openDatabase();
      await migrateDatabase(database);
      this.database = database;
    }
    return this.database;
  }

  initialize(): Promise<void> {
    return this.enqueue(async () => { await this.connection(); });
  }

  listRecords(): Promise<DiaryRecord[]> {
    return this.enqueue(async () => {
      const database = await this.connection();
      return (await database.getAllAsync<RecordRow>('SELECT * FROM diary_records ORDER BY julianday(occurred_at) DESC, id DESC')).map(fromRow);
    });
  }

  getRecord(id: string): Promise<DiaryRecord | null> {
    return this.enqueue(async () => {
      const database = await this.connection();
      const row = await database.getFirstAsync<RecordRow>('SELECT * FROM diary_records WHERE id = ?', id);
      return row ? fromRow(row) : null;
    });
  }

  createRecord(draft: RecordDraft): Promise<DiaryRecord> {
    return this.enqueue(async () => {
      validateRecordDraft(draft);
      const timestamp = this.now().toISOString();
      const record = { ...draft, id: this.createId(), createdAt: timestamp, updatedAt: timestamp, schemaVersion: 1 as const };
      validateDiaryRecord(record);
      const database = await this.connection();
      await inTransaction(database, async () => { await database.runAsync(INSERT, ...values(record)); });
      return JSON.parse(JSON.stringify(record)) as DiaryRecord;
    });
  }

  updateRecord(id: string, draft: RecordDraft): Promise<DiaryRecord> {
    return this.enqueue(async () => {
      validateRecordDraft(draft);
      const database = await this.connection();
      return inTransaction(database, async () => {
        const row = await database.getFirstAsync<RecordRow>('SELECT * FROM diary_records WHERE id = ?', id);
        if (!row) throw new Error('Record not found');
        const original = fromRow(row);
        if (original.kind !== draft.kind) throw new Error('Record kind cannot be changed');
        const updatedAt = new Date(Math.max(this.now().getTime(), Date.parse(original.updatedAt))).toISOString();
        const record = { ...draft, id: original.id, createdAt: original.createdAt, updatedAt, schemaVersion: 1 as const };
        validateDiaryRecord(record);
        const result = await database.runAsync(
          `UPDATE diary_records SET kind = ?, occurred_at = ?, local_date = ?, time_zone = ?,
            created_at = ?, updated_at = ?, schema_version = ?, details_json = ? WHERE id = ?`,
          ...values(record).slice(1), id,
        );
        if (result.changes !== 1) throw new Error('Record not found');
        return JSON.parse(JSON.stringify(record)) as DiaryRecord;
      });
    });
  }

  deleteRecord(id: string): Promise<void> {
    return this.enqueue(async () => {
      const database = await this.connection();
      await inTransaction(database, async () => {
        const result = await database.runAsync('DELETE FROM diary_records WHERE id = ?', id);
        if (result.changes !== 1) throw new Error('Record not found');
      });
    });
  }

  restoreRecord(record: DiaryRecord): Promise<void> {
    return this.enqueue(async () => {
      validateDiaryRecord(record);
      const database = await this.connection();
      await inTransaction(database, async () => { await database.runAsync(INSERT, ...values(record)); });
    });
  }

  getSettings(): Promise<AppSettings> {
    return this.enqueue(async () => this.readSettings(await this.connection()));
  }

  private async readSettings(database: AsyncSqliteDatabase): Promise<AppSettings> {
    const settings = await database.getFirstAsync<AppSettings>('SELECT language, appearance FROM app_settings WHERE id = 1');
    if (!settings) throw new Error('Settings not found');
    validateSettingsPatch(settings);
    return settings;
  }

  updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
    return this.enqueue(async () => {
      validateSettingsPatch(patch);
      const database = await this.connection();
      return inTransaction(database, async () => {
        const settings = { ...await this.readSettings(database), ...patch };
        const result = await database.runAsync('UPDATE app_settings SET language = ?, appearance = ? WHERE id = 1', settings.language, settings.appearance);
        if (result.changes !== 1) throw new Error('Settings not found');
        return settings;
      });
    });
  }
}

export function createDiaryRepository(options: RepositoryOptions = {}): DiaryRepository {
  if (typeof window !== 'undefined') return new LocalStorageDiaryRepository();
  return new SqliteDiaryRepository(options);
}
