import { isLocalDate, type DiaryRecord } from '@/domain/records';

export interface TodaySummary {
  entries: DiaryRecord[];
  counts: { food: number; bowel: number; symptom: number; exercise: number };
  waterMl: number;
  sleepDurationMinutes: number | undefined;
  streak: number;
}

export type GreetingKey = 'night' | 'morning' | 'noon' | 'afternoon' | 'evening';

export function getGreetingKey(hour: number): GreetingKey {
  return hour < 5 ? 'night' : hour < 11 ? 'morning' : hour < 14 ? 'noon' : hour < 18 ? 'afternoon' : 'evening';
}

export function summarizeToday(records: readonly DiaryRecord[], today: string): TodaySummary {
  if (!isLocalDate(today)) throw new Error('Invalid summary date');
  const entries = records
    .filter((record) => record.localDate === today)
    .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
  const counts = { food: 0, bowel: 0, symptom: 0, exercise: 0 };
  let waterMl = 0;
  let sleepDurationMinutes: number | undefined;

  for (const record of entries) {
    switch (record.kind) {
      case 'water':
        waterMl += record.details.volumeMl;
        break;
      case 'sleep':
        sleepDurationMinutes = Math.round((Date.parse(record.details.endedAt) - Date.parse(record.details.startedAt)) / 60000);
        break;
      default:
        counts[record.kind] += 1;
    }
  }

  const loggedDates = new Set(records.map((record) => record.localDate));
  // Calendar-day arithmetic in UTC avoids DST and device-time-zone changes.
  const cursor = new Date(`${today}T12:00:00.000Z`);
  let streak = 0;
  while (loggedDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { entries, counts, waterMl, sleepDurationMinutes, streak };
}
