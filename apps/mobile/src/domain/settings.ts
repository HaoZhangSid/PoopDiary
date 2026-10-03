export interface AppSettings {
  language: 'en' | 'fi' | 'zh';
  appearance: 'light' | 'dark' | 'system';
}

export const DEFAULT_SETTINGS: Readonly<AppSettings> = { language: 'en', appearance: 'system' };

export function validateSettingsPatch(value: unknown): asserts value is Partial<AppSettings> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Invalid settings');
  const patch = value as Record<string, unknown>;
  if (Object.keys(patch).some((key) => key !== 'language' && key !== 'appearance')) throw new Error('Unknown settings field');
  if ('language' in patch && !['en', 'fi', 'zh'].includes(patch.language as string)) throw new Error('Invalid language');
  if ('appearance' in patch && !['light', 'dark', 'system'].includes(patch.appearance as string)) throw new Error('Invalid appearance');
}
