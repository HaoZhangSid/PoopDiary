import type { DiaryRecord, RecordDraft } from '@/domain/records';

interface RecordWriter {
  createRecord: (draft: RecordDraft) => Promise<DiaryRecord>;
  updateRecord: (id: string, draft: RecordDraft) => Promise<DiaryRecord>;
}

interface Completion {
  isActive: () => boolean;
  onSaved: (record: DiaryRecord) => void;
  onFailed: () => void;
}

/** A write may finish after system Back; it must not navigate a different screen. */
export async function persistDraft(
  draft: RecordDraft,
  id: string | undefined,
  writer: RecordWriter,
  completion: Completion,
): Promise<void> {
  let saved: DiaryRecord;
  try {
    saved = id ? await writer.updateRecord(id, draft) : await writer.createRecord(draft);
  } catch {
    if (completion.isActive()) completion.onFailed();
    return;
  }
  // Keep UI exceptions outside the write-failure branch; a committed record must not invite another insert.
  if (completion.isActive()) completion.onSaved(saved);
}
