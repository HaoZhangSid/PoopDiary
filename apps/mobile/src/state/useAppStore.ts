import { create } from 'zustand';
import { createDiaryRepository, type DiaryRepository } from '../data/repositories';
import type { DiaryRecord, RecordDraft } from '../domain/records';
import { DEFAULT_SETTINGS, type AppSettings } from '../domain/settings';

export interface AppStore {
  records: DiaryRecord[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  settings: AppSettings;
  initialize(): Promise<void>;
  createRecord(draft: RecordDraft): Promise<DiaryRecord>;
  updateRecord(id: string, draft: RecordDraft): Promise<DiaryRecord>;
  deleteRecord(id: string): Promise<void>;
  restoreRecord(record: DiaryRecord): Promise<void>;
  updateSettings(patch: Partial<AppSettings>): Promise<void>;
}

const message = (error: unknown) => error instanceof Error ? error.message : 'Storage failed';
const sorted = (records: DiaryRecord[]) => [...records].sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt) || right.id.localeCompare(left.id));

export function createAppStore(repository: DiaryRepository = createDiaryRepository()) {
  let queue: Promise<unknown> = Promise.resolve();
  let initialization: Promise<void> | null = null;
  const enqueue = <T>(work: () => Promise<T>): Promise<T> => {
    const result = queue.then(work);
    queue = result.catch(() => undefined);
    return result;
  };

  return create<AppStore>((set, get) => {
    const ensureInitialized = async () => {
      if (get().status === 'ready') return;
      set({ status: 'loading', error: null });
      try {
        await repository.initialize();
        const [records, settings] = await Promise.all([repository.listRecords(), repository.getSettings()]);
        set({ records, settings, status: 'ready', error: null });
      } catch (error) {
        set({ status: 'error', error: message(error) });
        throw error;
      }
    };

    const write = <T>(work: () => Promise<T>) => enqueue(async () => {
      try {
        await ensureInitialized();
        const result = await work();
        set({ error: null });
        return result;
      } catch (error) {
        set({ error: message(error) });
        throw error;
      }
    });

    return {
      records: [], status: 'idle', error: null, settings: { ...DEFAULT_SETTINGS },
      initialize: () => {
        if (initialization) return initialization;
        if (get().status === 'ready') return Promise.resolve();
        initialization = enqueue(ensureInitialized).finally(() => { initialization = null; });
        return initialization;
      },
      createRecord: (draft) => write(async () => {
        const record = await repository.createRecord(draft);
        set({ records: sorted([...get().records, record]) });
        return record;
      }),
      updateRecord: (id, draft) => write(async () => {
        const record = await repository.updateRecord(id, draft);
        set({ records: sorted(get().records.map((existing) => existing.id === id ? record : existing)) });
        return record;
      }),
      deleteRecord: (id) => write(async () => {
        await repository.deleteRecord(id);
        set({ records: get().records.filter((record) => record.id !== id) });
      }),
      restoreRecord: (record) => write(async () => {
        await repository.restoreRecord(record);
        set({ records: sorted([...get().records, record]) });
      }),
      updateSettings: (patch) => write(async () => {
        const settings = await repository.updateSettings(patch);
        set({ settings });
      }),
    };
  });
}

export const useAppStore = createAppStore();
