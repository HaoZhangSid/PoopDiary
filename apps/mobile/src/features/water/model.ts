import { currentTime, localDateKey, localEventTimestamp, type DiaryRecord, type RecordDraft, type WaterDetails } from '@/domain/records';

export const beverageCodes = ['water', 'coffee', 'tea', 'soda', 'juice', 'milk', 'alcohol', 'other'] as const;
export type BeverageCode = (typeof beverageCodes)[number];
export const amountPresets = [250, 350, 500, 750] as const;

export interface WaterForm {
  beverage: BeverageCode;
  customName: string;
  volumeMl: number;
  date: string;
  time: string;
}

function recordedLocalTime(record: Extract<DiaryRecord, { kind: 'water' }>): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: record.timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(record.occurredAt));
}

export function createForm(record?: Extract<DiaryRecord, { kind: 'water' }>, now = new Date()): WaterForm {
  const details = record?.details;
  return {
    beverage: details?.beverage ?? 'water',
    customName: details?.customName ?? '',
    volumeMl: details?.volumeMl ?? 250,
    date: record?.localDate ?? localDateKey(now),
    time: record ? recordedLocalTime(record) : currentTime(now),
  };
}

export function createDraft(
  form: WaterForm,
  timeZone: string,
  original?: Extract<DiaryRecord, { kind: 'water' }>,
): RecordDraft {
  const keepsEvent = original && form.date === original.localDate && form.time === recordedLocalTime(original);
  const details: WaterDetails = {
    beverage: form.beverage,
    volumeMl: Math.round(form.volumeMl),
    ...(form.beverage === 'other' && form.customName.trim() ? { customName: form.customName.trim() } : {}),
  };
  return {
    kind: 'water',
    occurredAt: keepsEvent ? original.occurredAt : localEventTimestamp(form.date, form.time),
    localDate: form.date,
    timeZone: keepsEvent ? original.timeZone : timeZone,
    details,
  };
}
