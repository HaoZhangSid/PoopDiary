import type { DiaryRecord, RecordDraft } from '../../domain/records';
import type { AppSettings } from '../../domain/settings';

export interface DiaryRepository {
  initialize(): Promise<void>;
  listRecords(): Promise<DiaryRecord[]>;
  getRecord(id: string): Promise<DiaryRecord | null>;
  createRecord(draft: RecordDraft): Promise<DiaryRecord>;
  updateRecord(id: string, draft: RecordDraft): Promise<DiaryRecord>;
  deleteRecord(id: string): Promise<void>;
  restoreRecord(record: DiaryRecord): Promise<void>;
  getSettings(): Promise<AppSettings>;
  updateSettings(patch: Partial<AppSettings>): Promise<AppSettings>;
}
