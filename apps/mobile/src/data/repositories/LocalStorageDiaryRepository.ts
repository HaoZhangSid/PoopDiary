import { validateDiaryRecord, validateRecordDraft, type DiaryRecord, type RecordDraft } from '../../domain/records';
import { DEFAULT_SETTINGS, validateSettingsPatch, type AppSettings } from '../../domain/settings';
import type { DiaryRepository } from './DiaryRepository';

/**
 * Web-only persistence used by Expo Web. Native builds keep using SQLite;
 * the browser adapter avoids the shared-worker file lock that SQLite WASM can
 * hit when two dev tabs are open at once.
 */
export class LocalStorageDiaryRepository implements DiaryRepository {
  private readonly recordsKey = 'poop-diary.records.v1';
  private readonly settingsKey = 'poop-diary.settings.v1';
  private records: DiaryRecord[] = [];
  private settings: AppSettings = { ...DEFAULT_SETTINGS };

  async initialize(): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    try {
      const records = JSON.parse(localStorage.getItem(this.recordsKey) ?? '[]') as unknown;
      if (Array.isArray(records)) records.forEach(validateDiaryRecord);
      this.records = Array.isArray(records) ? records as DiaryRecord[] : [];
      const savedSettings = JSON.parse(localStorage.getItem(this.settingsKey) ?? 'null') as unknown;
      if (savedSettings && typeof savedSettings === 'object') {
        validateSettingsPatch(savedSettings as Partial<AppSettings>);
        this.settings = { ...DEFAULT_SETTINGS, ...(savedSettings as Partial<AppSettings>) };
      }
    } catch {
      this.records = [];
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  private persist() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.recordsKey, JSON.stringify(this.records));
    localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
  }

  listRecords(): Promise<DiaryRecord[]> { return Promise.resolve(this.sorted()); }
  getRecord(id: string): Promise<DiaryRecord | null> { return Promise.resolve(this.records.find((record) => record.id === id) ?? null); }

  createRecord(draft: RecordDraft): Promise<DiaryRecord> {
    validateRecordDraft(draft);
    const now = new Date().toISOString();
    const record: DiaryRecord = { ...draft, id: crypto.randomUUID(), createdAt: now, updatedAt: now, schemaVersion: 1 };
    this.records = [record, ...this.records];
    this.persist();
    return Promise.resolve(record);
  }

  updateRecord(id: string, draft: RecordDraft): Promise<DiaryRecord> {
    validateRecordDraft(draft);
    const index = this.records.findIndex((record) => record.id === id);
    if (index < 0) throw new Error('Record not found');
    if (this.records[index].kind !== draft.kind) throw new Error('Record kind cannot be changed');
    const record: DiaryRecord = { ...draft, id, createdAt: this.records[index].createdAt, updatedAt: new Date().toISOString(), schemaVersion: 1 };
    this.records = this.records.map((item, itemIndex) => itemIndex === index ? record : item);
    this.persist();
    return Promise.resolve(record);
  }

  deleteRecord(id: string): Promise<void> {
    const next = this.records.filter((record) => record.id !== id);
    if (next.length === this.records.length) throw new Error('Record not found');
    this.records = next;
    this.persist();
    return Promise.resolve();
  }

  restoreRecord(record: DiaryRecord): Promise<void> {
    validateDiaryRecord(record);
    this.records = [record, ...this.records.filter((item) => item.id !== record.id)];
    this.persist();
    return Promise.resolve();
  }

  getSettings(): Promise<AppSettings> { return Promise.resolve({ ...this.settings }); }

  updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
    validateSettingsPatch(patch);
    this.settings = { ...this.settings, ...patch };
    this.persist();
    return Promise.resolve({ ...this.settings });
  }

  private sorted() { return [...this.records].sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt) || right.id.localeCompare(left.id)); }
}
