import { describe, expect, it } from 'vitest';
import { validateRecordDraft, type SymptomDetails } from '@/domain/records';
import { createDraft, createForm, cycleSeverity } from './model';

describe('symptom form', () => {
  it('cycles each symptom through mild, moderate, severe and off', () => {
    let form = createForm(undefined, new Date(2026, 9, 3, 8, 30));
    form = cycleSeverity(form, 'bloating');
    expect(form.levels.bloating).toBe('mild');
    form = cycleSeverity(form, 'bloating');
    expect(form.levels.bloating).toBe('moderate');
    form = cycleSeverity(form, 'bloating');
    expect(form.levels.bloating).toBe('severe');
    form = cycleSeverity(form, 'bloating');
    expect(form.levels.bloating).toBeUndefined();
  });

  it('writes stable symptom codes and optional detail fields', () => {
    let form = createForm(undefined, new Date(2026, 9, 3, 8, 30));
    form = cycleSeverity(form, 'pain');
    form = cycleSeverity(form, 'nausea');
    form.onset = 'hourAgo'; form.duration = 'oneTo3'; form.painLevel = 7; form.painLocation = 'leftLower'; form.vomiting = true;
    const draft = createDraft(form, 'UTC');
    expect(draft).toMatchObject({ kind: 'symptom', localDate: '2026-10-03', details: { durationMinutes: 120, symptoms: [{ code: 'pain', severity: 'mild', painLevel: 7, painLocation: 'leftLower' }, { code: 'nausea', severity: 'mild', vomiting: true }] } });
    expect(() => validateRecordDraft(draft)).not.toThrow();
  });

  it('requires at least one selected symptom', () => {
    const form = createForm(undefined, new Date(2026, 9, 3, 8, 30));
    expect(() => createDraft(form, 'UTC')).toThrow('Choose a symptom');
  });

  it('keeps existing notes out of a blank new draft and preserves details on edit', () => {
    const details: SymptomDetails = { symptoms: [{ code: 'gas', severity: 'moderate' }], note: 'after lunch' };
    const record = { id: 'symptom-1', kind: 'symptom' as const, schemaVersion: 1 as const, createdAt: '2026-10-03T08:30:00.000Z', updatedAt: '2026-10-03T08:30:00.000Z', occurredAt: '2026-10-03T08:30:00.000Z', localDate: '2026-10-03', timeZone: 'UTC', details };
    const form = createForm(record);
    expect(form.levels.gas).toBe('moderate');
    form.note = 'updated';
    expect(createDraft(form, 'UTC', record).details).toMatchObject({ note: 'updated', symptoms: [{ code: 'gas', severity: 'moderate' }] });
  });
});
