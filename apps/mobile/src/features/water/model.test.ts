import { describe, expect, it } from 'vitest';
import { createDraft, createForm } from './model';

describe('water model', () => {
  it('creates a low-friction water draft with the current amount', () => {
    const form = createForm(undefined, new Date('2026-10-03T08:32:00'));
    expect(form).toMatchObject({ beverage: 'water', volumeMl: 250, date: '2026-10-03', time: '08:32' });
    expect(createDraft({ ...form, volumeMl: 500 }, 'Europe/Helsinki')).toMatchObject({
      kind: 'water', localDate: '2026-10-03', timeZone: 'Europe/Helsinki',
      details: { beverage: 'water', volumeMl: 500 },
    });
  });

  it('keeps the original event timestamp while editing details', () => {
    const original = {
      id: 'water-1', kind: 'water' as const,
      occurredAt: '2026-10-03T05:32:00.000Z', localDate: '2026-10-03', timeZone: 'Europe/Helsinki',
      createdAt: '2026-10-03T05:32:00.000Z', updatedAt: '2026-10-03T05:32:00.000Z', schemaVersion: 1 as const,
      details: { beverage: 'coffee' as const, volumeMl: 350 },
    };
    const form = createForm(original, new Date('2026-10-03T08:00:00'));
    const draft = createDraft({ ...form, volumeMl: 500 }, 'America/New_York', original);
    expect(draft.occurredAt).toBe(original.occurredAt);
    expect(draft.timeZone).toBe(original.timeZone);
    expect(draft.details).toEqual({ beverage: 'coffee', volumeMl: 500 });
  });

  it('keeps a custom beverage label only for the other option', () => {
    const form = createForm(undefined, new Date('2026-10-03T08:32:00'));
    expect(createDraft({ ...form, beverage: 'other', customName: 'Kombucha' }, 'Europe/Helsinki').details)
      .toEqual({ beverage: 'other', customName: 'Kombucha', volumeMl: 250 });
    expect(createDraft({ ...form, beverage: 'tea', customName: 'Ignored' }, 'Europe/Helsinki').details)
      .toEqual({ beverage: 'tea', volumeMl: 250 });
  });
});
