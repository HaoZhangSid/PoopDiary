import { describe, expect, it } from 'vitest';
import { resources } from '../src/i18n';

function keys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, item]) => typeof item === 'object' && item !== null
    ? keys(item, prefix + key + '.') : [prefix + key]);
}
function values(value: object): string[] {
  return Object.values(value).flatMap((item) => typeof item === 'object' && item !== null ? values(item) : [item]);
}
describe('translation coverage', () => {
  for (const language of ['fi', 'zh'] as const) {
    it(`${language} has the same keys as English`, () => expect(keys(resources[language]).sort()).toEqual(keys(resources.en).sort()));
    it(`${language} has no empty translations`, () => expect(values(resources[language]).every((text) => typeof text === 'string' && text.trim().length)).toBe(true));
  }
});
