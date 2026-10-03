import {
  localDateKey,
  localEventTimestamp,
  currentTime,
  type BowelRecord,
  type RecordDraft,
} from '@/domain/records';

export const stoolTypes = [1, 2, 3, 4, 5, 6, 7] as const;
export const feelings = ['easy', 'normal', 'difficult', 'veryDifficult'] as const;
export const sensations = ['bloating', 'pain', 'nausea', 'urgency', 'other'] as const;
export const painLocations = [
  'leftUpper', 'rightUpper', 'middle', 'leftLower', 'rightLower', 'whole',
] as const;
export const severityLevels = ['mild', 'moderate', 'severe'] as const;
export const urgencyLevels = ['some', 'urgent', 'nearMiss'] as const;

// These codes preserve the Web prototype's agreed safety pause; they are never persisted.
export const warningSigns = [
  'redBlood', 'blackStool', 'heavyBleeding', 'severePain', 'dizziness', 'feverVomiting',
] as const;
export type WarningSign = (typeof warningSigns)[number];
export function usesEmergencyCopy(sign: WarningSign): boolean {
  return ['blackStool', 'heavyBleeding', 'severePain', 'dizziness'].includes(sign);
}

type Details = BowelRecord['details'];
export interface BowelForm {
  stoolType: Details['stoolType'] | undefined;
  feeling: Details['feeling'];
  sensations: Details['sensations'];
  painLevel: NonNullable<Details['painLevel']>;
  painLocation: NonNullable<Details['painLocation']>;
  bloating: NonNullable<Details['bloating']>;
  urgency: NonNullable<Details['urgency']>;
  note: string;
  date: string;
  time: string;
}

function recordedLocalTime(record: BowelRecord): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: record.timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(record.occurredAt));
}

export function createForm(record?: BowelRecord, now = new Date()): BowelForm {
  const details = record?.details;
  return {
    stoolType: details?.stoolType,
    feeling: details?.feeling ?? 'unrecorded',
    sensations: [...(details?.sensations ?? [])],
    painLevel: details?.painLevel ?? 4,
    painLocation: details?.painLocation ?? 'middle',
    bloating: details?.bloating ?? 'mild',
    urgency: details?.urgency ?? 'some',
    note: details?.note ?? '',
    date: record?.localDate ?? localDateKey(now),
    time: record ? recordedLocalTime(record) : currentTime(now),
  };
}

export function toggleSensation(form: BowelForm, sensation: Details['sensations'][number]): BowelForm {
  return {
    ...form,
    sensations: form.sensations.includes(sensation)
      ? form.sensations.filter((item) => item !== sensation)
      : [...form.sensations, sensation],
  };
}

export function createDraft(form: BowelForm, timeZone: string, original?: BowelRecord, forceTimeUpdate = false): RecordDraft {
  if (form.stoolType === undefined) throw new Error('A stool type is required.');
  const has = (sensation: Details['sensations'][number]) => form.sensations.includes(sensation);
  // Editing another field while travelling must not silently move the original event.
  const keepsEvent = original && !forceTimeUpdate && form.date === original.localDate && form.time === recordedLocalTime(original);
  return {
    kind: 'bowel',
    occurredAt: keepsEvent ? original.occurredAt : localEventTimestamp(form.date, form.time),
    localDate: form.date,
    timeZone: keepsEvent ? original.timeZone : timeZone,
    details: {
      stoolType: form.stoolType,
      feeling: form.feeling,
      sensations: [...form.sensations],
      ...(has('pain') ? { painLevel: form.painLevel, painLocation: form.painLocation } : {}),
      ...(has('bloating') ? { bloating: form.bloating } : {}),
      ...(has('urgency') ? { urgency: form.urgency } : {}),
      ...(form.note.trim() ? { note: form.note.trim() } : {}),
    },
  };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Keep day 31 valid when moving to February or another shorter month. */
export function updateDatePart(date: string, part: 'year' | 'month' | 'day', value: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const nextYear = part === 'year' ? value : year;
  const nextMonth = part === 'month' ? value : month;
  const nextDay = Math.min(part === 'day' ? value : day, daysInMonth(nextYear, nextMonth));
  return `${String(nextYear).padStart(4, '0')}-${String(nextMonth).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
}
