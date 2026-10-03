const pad = (value: number) => String(value).padStart(2, '0');

function requireDate(date: Date): void {
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid date');
}

export function localDateKey(date: Date): string {
  requireDate(date);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function currentTime(date = new Date()): string {
  requireDate(date);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function currentTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function isLocalDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return year >= 1 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
  if (!isLocalDate(value.slice(0, 10))) return false;
  const hour = Number(value.slice(11, 13));
  const minute = Number(value.slice(14, 16));
  const second = Number(value.slice(17, 19));
  const offset = value.match(/([+-])(\d{2}):(\d{2})$/);
  if (hour > 23 || minute > 59 || second > 59 || (offset && (Number(offset[2]) > 23 || Number(offset[3]) > 59))) return false;
  return Number.isFinite(Date.parse(value));
}

export function dateKeyInTimeZone(timestamp: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(timestamp));
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${value('year')?.padStart(4, '0')}-${value('month')}-${value('day')}`;
}

// The editor supplies the device's local wall time. A skipped DST time must not silently move an event.
export function localEventTimestamp(localDate: string, time: string): string {
  if (!isLocalDate(localDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Invalid local date or time');
  const [year, month, day] = localDate.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(hour, minute, 0, 0);
  if (localDateKey(date) !== localDate || currentTime(date) !== time) throw new Error('This local time does not exist');
  return date.toISOString();
}
