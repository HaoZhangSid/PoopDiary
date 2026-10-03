import { describe, expect, it, vi } from 'vitest';
import type { BowelRecord, DiaryRecord, RecordDraft } from '@/domain/records';
import { persistDraft } from './persistDraft';

const draft: RecordDraft = {
  kind: 'bowel', occurredAt: '2026-10-03T08:30:00.000Z', localDate: '2026-10-03', timeZone: 'UTC',
  details: { stoolType: 4, feeling: 'unrecorded', sensations: [] },
};
const saved: BowelRecord = {
  ...draft, id: 'saved-record', schemaVersion: 1,
  createdAt: '2026-10-03T08:30:00.000Z', updatedAt: '2026-10-03T08:30:00.000Z',
};

function deferredWrite() {
  let resolve!: (record: DiaryRecord) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<DiaryRecord>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

describe('Bowel write completion', () => {
  it('allows a pending write to complete without routing or feedback after the editor leaves', async () => {
    const pending = deferredWrite();
    const writer = { createRecord: vi.fn(() => pending.promise), updateRecord: vi.fn() };
    let active = true;
    const completion = { isActive: () => active, onSaved: vi.fn(), onFailed: vi.fn() };
    const task = persistDraft(draft, undefined, writer, completion);
    expect(writer.createRecord).toHaveBeenCalledWith(draft);
    active = false;
    pending.resolve(saved);
    await task;
    expect(writer.createRecord).toHaveBeenCalledTimes(1);
    expect(completion.onSaved).not.toHaveBeenCalled();
    expect(completion.onFailed).not.toHaveBeenCalled();
  });

  it('does not update an unmounted editor after a delayed write failure', async () => {
    const pending = deferredWrite();
    const writer = { createRecord: vi.fn(() => pending.promise), updateRecord: vi.fn() };
    let active = true;
    const completion = { isActive: () => active, onSaved: vi.fn(), onFailed: vi.fn() };
    const task = persistDraft(draft, undefined, writer, completion);
    active = false;
    pending.reject(new Error('SQLite locked'));
    await task;
    expect(completion.onSaved).not.toHaveBeenCalled();
    expect(completion.onFailed).not.toHaveBeenCalled();
  });

  it('dispatches a failure to the active editor so it can show an error and retry', async () => {
    const writer = { createRecord: vi.fn(async () => { throw new Error('SQLite locked'); }), updateRecord: vi.fn() };
    const completion = { isActive: () => true, onSaved: vi.fn(), onFailed: vi.fn() };
    await persistDraft(draft, undefined, writer, completion);
    expect(completion.onFailed).toHaveBeenCalledTimes(1);
    expect(completion.onSaved).not.toHaveBeenCalled();
  });

  it('uses the update path and only dispatches success after the write resolves', async () => {
    const pending = deferredWrite();
    const writer = { createRecord: vi.fn(), updateRecord: vi.fn(() => pending.promise) };
    const completion = { isActive: () => true, onSaved: vi.fn(), onFailed: vi.fn() };
    const task = persistDraft(draft, saved.id, writer, completion);
    expect(completion.onSaved).not.toHaveBeenCalled();
    pending.resolve(saved);
    await task;
    expect(writer.updateRecord).toHaveBeenCalledWith(saved.id, draft);
    expect(writer.createRecord).not.toHaveBeenCalled();
    expect(completion.onSaved).toHaveBeenCalledWith(saved);
  });

  it('keeps UI callback errors separate from a committed database write', async () => {
    const writer = { createRecord: vi.fn(async () => saved), updateRecord: vi.fn() };
    const completion = {
      isActive: () => true, onSaved: vi.fn(() => { throw new Error('Navigation error'); }), onFailed: vi.fn(),
    };
    await expect(persistDraft(draft, undefined, writer, completion)).rejects.toThrow('Navigation error');
    expect(writer.createRecord).toHaveBeenCalledTimes(1);
    expect(completion.onFailed).not.toHaveBeenCalled();
  });
});
