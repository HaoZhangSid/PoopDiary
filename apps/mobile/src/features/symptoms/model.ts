import { currentTime, localDateKey, localEventTimestamp, type PainLevel, type PainLocation, type RecordDraft, type Severity, type SymptomEntry, type SymptomDetails, type DiaryRecord } from '@/domain/records';

export const symptomCodes = ['bloating', 'pain', 'nausea', 'heartburn', 'gas', 'frequency', 'other'] as const;
export type SymptomCode = (typeof symptomCodes)[number];
export const severityLevels = ['mild', 'moderate', 'severe'] as const;
export const painLocations: PainLocation[] = ['leftUpper', 'rightUpper', 'middle', 'leftLower', 'rightLower', 'whole'];
export const onsetOptions = ['now', 'hourAgo', 'earlier', 'unknown'] as const;
export const durationOptions = ['under30', 'thirtyTo60', 'oneTo3', 'over3', 'unknown'] as const;
export type SymptomStep = 'select' | 'details' | 'save';

export const warningSigns = ['breathingOrChestPain', 'severeOrWorseningPain', 'dizzyOrFaint', 'persistentVomiting', 'highFever', 'heavyBleedingOrBlackStool'] as const;
export type WarningSign = (typeof warningSigns)[number];
export const emergencyWarnings: WarningSign[] = ['breathingOrChestPain', 'severeOrWorseningPain', 'dizzyOrFaint', 'heavyBleedingOrBlackStool'];

export interface SymptomForm {
  levels: Partial<Record<SymptomCode, Severity>>;
  painLevel: PainLevel;
  painLocation: PainLocation;
  vomiting: boolean;
  onset: (typeof onsetOptions)[number];
  duration: (typeof durationOptions)[number];
  note: string;
  date: string;
  time: string;
}

function recordedLocalTime(record: Extract<DiaryRecord, { kind: 'symptom' }>): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: record.timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(record.occurredAt));
}

function severityFromUnknown(value: unknown): Severity {
  return value === 'severe' ? 'severe' : value === 'moderate' ? 'moderate' : 'mild';
}

function durationFromMinutes(value: number | undefined): SymptomForm['duration'] {
  if (value === undefined) return 'unknown';
  if (value < 30) return 'under30';
  if (value <= 60) return 'thirtyTo60';
  if (value <= 180) return 'oneTo3';
  return 'over3';
}

function onsetFromStartedAt(value: string | undefined): SymptomForm['onset'] {
  if (!value) return 'unknown';
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 60_000));
  if (minutes < 30) return 'now';
  if (minutes <= 120) return 'hourAgo';
  return 'earlier';
}

export function createForm(record?: Extract<DiaryRecord, { kind: 'symptom' }>, now = new Date()): SymptomForm {
  const details = record?.details;
  const levels: SymptomForm['levels'] = {};
  details?.symptoms.forEach((entry) => { levels[entry.code] = severityFromUnknown(entry.severity); });
  const pain = details?.symptoms.find((entry) => entry.code === 'pain');
  const nausea = details?.symptoms.find((entry) => entry.code === 'nausea');
  return {
    levels,
    painLevel: pain?.painLevel ?? 4,
    painLocation: pain?.painLocation ?? 'middle',
    vomiting: nausea?.vomiting ?? false,
    onset: onsetFromStartedAt(details?.startedAt),
    duration: durationFromMinutes(details?.durationMinutes),
    note: details?.note ?? '',
    date: record?.localDate ?? localDateKey(now),
    time: record ? recordedLocalTime(record) : currentTime(now),
  };
}

export function cycleSeverity(form: SymptomForm, code: SymptomCode): SymptomForm {
  const current = form.levels[code];
  const next = current === undefined ? 'mild' : current === 'mild' ? 'moderate' : current === 'moderate' ? 'severe' : undefined;
  const levels = { ...form.levels };
  if (next) levels[code] = next; else delete levels[code];
  return { ...form, levels };
}

function durationMinutes(value: SymptomForm['duration']): number | undefined {
  return value === 'under30' ? 20 : value === 'thirtyTo60' ? 45 : value === 'oneTo3' ? 120 : value === 'over3' ? 240 : undefined;
}

function startedAt(value: SymptomForm['onset'], occurredAt: string): string | undefined {
  const minutes = value === 'now' ? 0 : value === 'hourAgo' ? 60 : value === 'earlier' ? 240 : undefined;
  return minutes === undefined ? undefined : new Date(Date.parse(occurredAt) - minutes * 60_000).toISOString();
}

export function createDraft(form: SymptomForm, timeZone: string, original?: Extract<DiaryRecord, { kind: 'symptom' }>, forceTimeUpdate = false): RecordDraft {
  const entries: SymptomEntry[] = Object.entries(form.levels).filter((item): item is [SymptomCode, Severity] => Boolean(item[1])).map(([code, severity]) => ({
    code, severity,
    ...(code === 'pain' ? { painLevel: form.painLevel, painLocation: form.painLocation } : {}),
    ...(code === 'nausea' ? { vomiting: form.vomiting } : {}),
  }));
  if (!entries.length) throw new Error('Choose a symptom');
  const keepsEvent = original && !forceTimeUpdate && form.date === original.localDate && form.time === recordedLocalTime(original);
  const occurredAt = keepsEvent ? original.occurredAt : localEventTimestamp(form.date, form.time);
  const details: SymptomDetails = {
    symptoms: entries,
    ...(startedAt(form.onset, occurredAt) ? { startedAt: startedAt(form.onset, occurredAt) } : {}),
    ...(durationMinutes(form.duration) !== undefined ? { durationMinutes: durationMinutes(form.duration) } : {}),
    ...(form.note.trim() ? { note: form.note.trim() } : {}),
  };
  return { kind: 'symptom', occurredAt, localDate: form.date, timeZone: keepsEvent ? original.timeZone : timeZone, details };
}

export function formatSymptomSummary(details: SymptomDetails): string {
  return details.symptoms.map(({ code, severity }) => `${code} · ${severity}`).join(' · ');
}
