import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  currentTime, dateKeyInTimeZone, isIsoTimestamp, isLocalDate, localDateKey, localEventTimestamp,
  validateDiaryRecord, validateRecordDraft, type DiaryRecord, type RecordDraft,
} from '../src/domain/records';

const event = { occurredAt: '2026-10-03T10:30:00.000Z', localDate: '2026-10-03', timeZone: 'Europe/Helsinki' };
const bowel: RecordDraft = { ...event, kind: 'bowel', details: { stoolType: 4, feeling: 'normal', sensations: [], note: '用户的备注' } };

afterEach(() => vi.unstubAllEnvs());

describe('record validation', () => {
  it('accepts all six typed flows and preserves user text', () => {
    const drafts: RecordDraft[] = [
      bowel,
      { ...event, kind: 'food', details: { meal: 'lunch', method: 'manual', items: [{ name: 'Ruisleipä / 面包', quantity: 2, unit: 'piece', tags: ['wholegrain'], nutrition: { fiber: 4 } }] } },
      { ...event, kind: 'symptom', details: { symptoms: [{ code: 'gas', severity: 'mild' }, { code: 'pain', severity: 'moderate', painLevel: 3, painLocation: 'middle' }] } },
      { ...event, kind: 'water', details: { beverage: 'other', customName: '自制饮料', volumeMl: 250 } },
      { ...event, kind: 'exercise', details: { activity: 'swimming', durationMinutes: 30, intensity: 'moderate', distanceKm: 0.5 } },
      { ...event, kind: 'sleep', details: { startedAt: '2026-10-02T20:30:00.000Z', endedAt: event.occurredAt, quality: 'great', awakenings: 1, energy: 'energized' } },
    ];
    for (const draft of drafts) expect(() => validateRecordDraft(draft)).not.toThrow();
    expect(bowel.details.note).toBe('用户的备注');
  });

  it.each([
    { ...bowel, details: { ...bowel.details, feeling: '正常' } },
    { ...bowel, details: { ...bowel.details, stoolType: '4' } },
    { ...bowel, details: { ...bowel.details, stoolType: 8 } },
    { ...bowel, details: { ...bowel.details, painLevel: 11 } },
    { ...bowel, details: { ...bowel.details, painLevel: 1.5 } },
    { ...bowel, details: { ...bowel.details, sensations: ['pain', 'pain'] } },
    { ...bowel, details: { ...bowel.details, sensations: ['blood'] } },
    { ...bowel, title: 'translated summary' },
  ])('rejects translated codes, invalid choices and derived fields', (invalid) => {
    expect(() => validateRecordDraft(invalid)).toThrow();
  });

  it.each(['warning', 'warnings'])('refuses unresolved %s at the writer boundary', (field) => {
    expect(() => validateRecordDraft({ ...bowel, [field]: [] })).toThrow('Safety warnings');
    expect(() => validateRecordDraft({ ...bowel, details: { ...bowel.details, [field]: ['blood'] } })).toThrow('Safety warnings');
  });

  it('rejects impossible dates, mismatched diary days and invalid time zones', () => {
    expect(() => validateRecordDraft({ ...bowel, localDate: '2026-02-30' })).toThrow('local date');
    expect(() => validateRecordDraft({ ...bowel, localDate: '2026-10-02' })).toThrow('does not match');
    expect(() => validateRecordDraft({ ...bowel, timeZone: 'invalid/time-zone' })).toThrow('time zone');
    expect(isIsoTimestamp('2026-02-30T10:00:00Z')).toBe(false);
    expect(isIsoTimestamp('2026-10-03T24:00:00Z')).toBe(false);
    expect(isIsoTimestamp('2026-10-03T12:00:00+03:00')).toBe(true);
  });

  it('requires positive volumes and a wake-up timestamp for overnight sleep', () => {
    expect(() => validateRecordDraft({ ...event, kind: 'water', details: { beverage: 'water', volumeMl: 0 } })).toThrow('volume');
    expect(() => validateRecordDraft({ ...event, kind: 'sleep', details: { startedAt: '2026-10-02T20:30:00Z', endedAt: '2026-10-03T05:30:00Z', quality: 'good' } })).toThrow('end time');
  });

  it('validates stored metadata before records reach the cache', () => {
    const record: DiaryRecord = { ...bowel, id: 'entry-1', createdAt: event.occurredAt, updatedAt: event.occurredAt, schemaVersion: 1 };
    expect(() => validateDiaryRecord(record)).not.toThrow();
    expect(() => validateDiaryRecord({ ...record, schemaVersion: 2 })).toThrow('schema version');
    expect(() => validateDiaryRecord({ ...record, updatedAt: '2026-10-02T10:30:00Z' })).toThrow('timestamps');
  });
});

describe('local date and time', () => {
  it('rejects impossible diary date parameters without throwing', () => {
    for (const value of ['2026-13-01', '2026-00-01', '2026-01-32', '2026-02-29', undefined, ['2026-10-03']]) {
      expect(() => isLocalDate(value)).not.toThrow();
      expect(isLocalDate(value)).toBe(false);
    }
    expect(isLocalDate('2026-10-03')).toBe(true);
    expect(isLocalDate('2024-02-29')).toBe(true);
  });

  it('keeps a midnight event on its local day even when UTC is the previous day', () => {
    vi.stubEnv('TZ', 'Europe/Helsinki');
    const date = new Date(2026, 9, 3, 0, 15);
    expect(localDateKey(date)).toBe('2026-10-03');
    expect(currentTime(date)).toBe('00:15');
    expect(localEventTimestamp('2026-10-03', '00:15')).toBe('2026-10-02T21:15:00.000Z');
    expect(dateKeyInTimeZone(date.toISOString(), 'Europe/Helsinki')).toBe('2026-10-03');
  });

  it('rejects invalid calendar/time input and times skipped by daylight saving', () => {
    vi.stubEnv('TZ', 'Europe/Helsinki');
    expect(() => localEventTimestamp('2026-02-30', '12:00')).toThrow();
    expect(() => localEventTimestamp('2026-10-03', '24:00')).toThrow();
    expect(() => localEventTimestamp('2026-03-29', '03:30')).toThrow('does not exist');
    expect(() => localDateKey(new Date(NaN))).toThrow('Invalid date');
  });
});
