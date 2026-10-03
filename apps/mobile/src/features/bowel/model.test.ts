import { afterEach, describe, expect, it, vi } from 'vitest';
import { validateRecordDraft, type BowelRecord } from '@/domain/records';
import { adjacentStep, createDraft, createForm, detailSteps, toggleSensation, updateDatePart, usesEmergencyCopy, warningSigns } from './model';

const existing: BowelRecord = {
  id: 'existing', kind: 'bowel', schemaVersion: 1,
  createdAt: '2026-10-03T05:30:00.000Z', updatedAt: '2026-10-03T05:30:00.000Z',
  occurredAt: '2026-10-03T05:30:00.000Z', localDate: '2026-10-03', timeZone: 'Europe/Helsinki',
  details: {
    stoolType: 1, feeling: 'difficult', sensations: ['pain', 'bloating', 'urgency', 'other'],
    painLevel: 0, painLocation: 'leftLower', bloating: 'moderate', urgency: 'nearMiss', note: 'My own text',
  },
};

afterEach(() => vi.unstubAllEnvs());

describe('Bowel draft', () => {
  it('prefills every recorded field, including a zero pain value', () => {
    expect(createForm(existing)).toMatchObject({
      ...existing.details, date: '2026-10-03', time: '08:30',
    });
  });

  it('preserves the original event when editing other fields in another time zone', () => {
    const form = createForm(existing);
    form.stoolType = 4;
    form.note = 'Edited';
    const draft = createDraft(form, 'America/New_York', existing);
    expect(draft).toMatchObject({
      occurredAt: existing.occurredAt, timeZone: existing.timeZone, localDate: existing.localDate,
      details: { stoolType: 4, painLevel: 0, note: 'Edited' },
    });
    expect(() => validateRecordDraft(draft)).not.toThrow();
  });

  it('honors an explicit current-time action even when the displayed wall time is unchanged', () => {
    vi.stubEnv('TZ', 'America/New_York');
    const form = createForm(existing);
    const draft = createDraft(form, 'America/New_York', existing, true);
    expect(draft).toMatchObject({
      occurredAt: '2026-10-03T12:30:00.000Z', timeZone: 'America/New_York', localDate: '2026-10-03',
    });
    expect(draft.occurredAt).not.toBe(existing.occurredAt);
    expect(() => validateRecordDraft(draft)).not.toThrow();
  });

  it('keeps the exact original timestamp when no time change is committed', () => {
    vi.stubEnv('TZ', 'America/New_York');
    const form = createForm(existing);
    expect(createDraft(form, 'America/New_York', existing, false)).toMatchObject({
      occurredAt: existing.occurredAt, timeZone: existing.timeZone,
    });
  });

  it('keeps edits in a separate draft so cancellation leaves the stored record intact', () => {
    const original = structuredClone(existing);
    const form = toggleSensation(createForm(existing), 'pain');
    form.note = 'Unsaved note';
    expect(existing).toEqual(original);
    expect(form.sensations).not.toContain('pain');
  });

  it('drops hidden symptom details and never persists safety signals', () => {
    const form = createForm(existing);
    form.sensations = [];
    const draft = createDraft(form, existing.timeZone, existing);
    expect(draft.details).not.toHaveProperty('painLevel');
    expect(draft.details).not.toHaveProperty('painLocation');
    expect(draft.details).not.toHaveProperty('bloating');
    expect(draft.details).not.toHaveProperty('urgency');
    expect(draft.details).not.toHaveProperty('warnings');
    expect(draft.details).not.toHaveProperty('warningSigns');
    expect(() => validateRecordDraft(draft)).not.toThrow();
  });

  it('requires an explicit shape while allowing unknown as a complete quick record', () => {
    const form = createForm(undefined, new Date(2026, 9, 3, 8, 45));
    expect(() => createDraft(form, Intl.DateTimeFormat().resolvedOptions().timeZone)).toThrow();
    form.stoolType = 'unknown';
    const draft = createDraft(form, Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(draft.details).toEqual({ stoolType: 'unknown', feeling: 'unrecorded', sensations: [] });
    expect(() => validateRecordDraft(draft)).not.toThrow();
  });

  it('keeps the existing safety branches without adding severity inference', () => {
    expect(warningSigns.filter(usesEmergencyCopy)).toEqual(['blackStool', 'heavyBleeding', 'severePain', 'dizziness']);
    expect(usesEmergencyCopy('redBlood')).toBe(false);
    expect(usesEmergencyCopy('feverVomiting')).toBe(false);
  });
});

describe('Date controls', () => {
  it('clamps day 31 when moving to February, including leap years', () => {
    expect(updateDatePart('2026-01-31', 'month', 2)).toBe('2026-02-28');
    expect(updateDatePart('2024-01-31', 'month', 2)).toBe('2024-02-29');
    expect(updateDatePart('2024-02-29', 'year', 2026)).toBe('2026-02-28');
  });
});

describe('Web detail flow parity', () => {
  it('skips symptom detail pages when no matching symptom was selected', () => {
    const form = createForm();
    expect(detailSteps(form)).toEqual(['type', 'feeling', 'sensations', 'time']);
    expect(adjacentStep(form, 'sensations', 1)).toBe('time');
    expect(adjacentStep(form, 'time', -1)).toBe('sensations');
  });

  it('keeps pain, bloating and urgency as separate pages with correct forward and back order', () => {
    const form = createForm(existing);
    expect(detailSteps(form)).toEqual(['type', 'feeling', 'sensations', 'pain', 'bloating', 'urgency', 'time']);
    expect(adjacentStep(form, 'pain', 1)).toBe('bloating');
    expect(adjacentStep(form, 'bloating', 1)).toBe('urgency');
    expect(adjacentStep(form, 'urgency', 1)).toBe('time');
    expect(adjacentStep(form, 'time', -1)).toBe('urgency');
    expect(adjacentStep(form, 'bloating', -1)).toBe('pain');
  });

  it('updates the next page after the user goes back and deselects a symptom', () => {
    const form = toggleSensation(createForm(existing), 'pain');
    expect(adjacentStep(form, 'sensations', 1)).toBe('bloating');
    expect(adjacentStep(form, 'bloating', -1)).toBe('sensations');
    expect(adjacentStep(form, 'type', -1)).toBe('type');
    expect(adjacentStep(form, 'time', 1)).toBe('time');
  });
});
