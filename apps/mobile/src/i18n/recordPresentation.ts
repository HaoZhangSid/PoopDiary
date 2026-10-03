import i18n from './index';
import type { DiaryRecord } from '@/domain/records';

export const localeFor = (language: string) => language === 'zh' ? 'zh-CN' : language === 'fi' ? 'fi-FI' : 'en-GB';
export function displayDate(dateKey: string, language: string, weekday = false) {
  return new Date(`${dateKey}T12:00:00Z`).toLocaleDateString(localeFor(language), {
    timeZone: 'UTC', month: 'short', day: 'numeric', ...(weekday ? { weekday: 'short' } : {}),
  });
}
export function displayTime(record: DiaryRecord, language: string) {
  return new Date(record.occurredAt).toLocaleTimeString(localeFor(language), {
    timeZone: record.timeZone, hour: '2-digit', minute: '2-digit', hour12: false,
  });
}
export function recordTitle(record: DiaryRecord) {
  if (record.kind === 'bowel') return record.details.stoolType === 'unknown'
    ? i18n.t('unknown', { ns: 'common' })
    : i18n.t('type', { ns: 'common', type: record.details.stoolType });
  return i18n.t(record.kind, { ns: 'common' });
}
export function recordSummary(record: DiaryRecord) {
  if (record.kind === 'bowel') {
    const { stoolType, feeling, sensations } = record.details;
    return [
      stoolType === 'unknown' ? '' : i18n.t(`types.${stoolType}`, { ns: 'bowel' }),
      feeling === 'unrecorded' ? '' : i18n.t(`feelings.${feeling}`, { ns: 'bowel' }),
      ...sensations.map((code) => i18n.t(`sensations.${code}`, { ns: 'bowel' })),
    ].filter(Boolean).join(' · ');
  }
  if (record.kind === 'food') return record.details.items.map((item) => item.name).join(' + ');
  if (record.kind === 'water') return `${record.details.volumeMl} ml`;
  return record.details.note ?? '';
}
