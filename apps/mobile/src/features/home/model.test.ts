import { describe, expect, it } from 'vitest';
import type { DiaryRecord, RecordDetailsByKind, RecordKind } from '@/domain/records';
import { getGreetingKey, summarizeToday } from './model';

function record<K extends RecordKind>(kind: K, details: RecordDetailsByKind[K], day = '2026-10-03', hour = '08:00', id = `${kind}-${day}-${hour}`): DiaryRecord {
  const occurredAt = `${day}T${hour}:00.000Z`;
  return {
    id, kind, details, occurredAt, localDate: day, timeZone: 'UTC',
    schemaVersion: 1, createdAt: occurredAt, updatedAt: occurredAt,
  } as DiaryRecord;
}

const bowelDetails: RecordDetailsByKind['bowel'] = { stoolType: 4, feeling: 'normal', sensations: [] };
const foodDetails: RecordDetailsByKind['food'] = { meal: 'breakfast', method: 'manual', items: [{ name: 'Oats', quantity: 1, unit: 'portion' }] };

describe('Home summary', () => {
  it('aggregates all six record kinds for the selected local date', () => {
    const records = [
      record('food', foodDetails),
      record('food', { ...foodDetails, meal: 'lunch' }, undefined, '12:00'),
      record('bowel', bowelDetails),
      record('symptom', { symptoms: [{ code: 'bloating', severity: 'mild' }, { code: 'nausea', severity: 'moderate' }] }),
      record('water', { beverage: 'water', volumeMl: 250 }),
      record('water', { beverage: 'coffee', volumeMl: 150 }, undefined, '09:00'),
      record('exercise', { activity: 'walking', durationMinutes: 30, intensity: 'light' }),
      record('sleep', { startedAt: '2026-10-02T23:30:00.000Z', endedAt: '2026-10-03T07:00:00.000Z', quality: 'good' }, undefined, '07:00'),
      record('water', { beverage: 'water', volumeMl: 500 }, '2026-10-02'),
    ];
    expect(summarizeToday(records, '2026-10-03')).toMatchObject({
      counts: { food: 2, bowel: 1, symptom: 1, exercise: 1 },
      waterMl: 400, sleepDurationMinutes: 450, streak: 2,
    });
    expect(summarizeToday(records, '2026-10-03').entries).toHaveLength(8);
  });

  it('sorts actual event times without mutating records and uses the latest sleep', () => {
    const laterSleep = record('sleep', { startedAt: '2026-10-03T12:00:00.000Z', endedAt: '2026-10-03T13:00:00.000Z', quality: 'fair' }, undefined, '13:00');
    const earlierSleep = record('sleep', { startedAt: '2026-10-02T23:30:00.000Z', endedAt: '2026-10-03T07:00:00.000Z', quality: 'good' }, undefined, '07:00');
    const offsetRecord = { ...record('bowel', bowelDetails), occurredAt: '2026-10-03T09:00:00+03:00' };
    const records = [laterSleep, earlierSleep, offsetRecord];
    const before = structuredClone(records);
    const summary = summarizeToday(Object.freeze(records), '2026-10-03');
    expect(summary.entries.map((entry) => entry.id)).toEqual([offsetRecord.id, earlierSleep.id, laterSleep.id]);
    expect(summary.sleepDurationMinutes).toBe(60);
    expect(records).toEqual(before);
  });

  it('uses stored diary dates rather than recalculating dates from timestamps', () => {
    const pastUtcEvent = { ...record('bowel', bowelDetails), occurredAt: '2026-10-02T22:30:00.000Z', timeZone: 'Europe/Helsinki' };
    expect(summarizeToday([pastUtcEvent], '2026-10-03').counts.bowel).toBe(1);
    expect(summarizeToday([pastUtcEvent], '2026-10-02').entries).toEqual([]);
  });

  it('returns zero counts and no sleep when today has no entries', () => {
    expect(summarizeToday([record('bowel', bowelDetails, '2026-10-02')], '2026-10-03')).toEqual({
      entries: [], counts: { food: 0, bowel: 0, symptom: 0, exercise: 0 },
      waterMl: 0, sleepDurationMinutes: undefined, streak: 0,
    });
  });

  it('counts each logged day once and stops at the first missing date', () => {
    const records = ['2026-10-03', '2026-10-03', '2026-10-02', '2026-09-30', '2026-10-04'].map((day, index) => record('bowel', bowelDetails, day, '08:00', String(index)));
    expect(summarizeToday(records, '2026-10-03').streak).toBe(2);
  });

  it('keeps streaks consecutive across leap days, month changes and year changes', () => {
    const leapDays = ['2024-03-01', '2024-02-29', '2024-02-28'].map((day) => record('bowel', bowelDetails, day));
    const newYear = ['2027-01-01', '2026-12-31', '2026-12-30'].map((day) => record('bowel', bowelDetails, day));
    expect(summarizeToday(leapDays, '2024-03-01').streak).toBe(3);
    expect(summarizeToday(newYear, '2027-01-01').streak).toBe(3);
  });
});

describe('Home greeting', () => {
  it.each([
    [0, 'night'], [4, 'night'], [5, 'morning'], [10, 'morning'],
    [11, 'noon'], [13, 'noon'], [14, 'afternoon'], [17, 'afternoon'],
    [18, 'evening'], [23, 'evening'],
  ] as const)('uses the original greeting at hour %i', (hour, greeting) => {
    expect(getGreetingKey(hour)).toBe(greeting);
  });
});
