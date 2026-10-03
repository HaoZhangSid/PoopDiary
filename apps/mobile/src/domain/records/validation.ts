import { dateKeyInTimeZone, isIsoTimestamp, isLocalDate } from './dates';
import { RECORD_KINDS, type DiaryRecord, type RecordDraft, type RecordKind } from './types';

export class RecordValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecordValidationError';
  }
}

type Fields = Record<string, unknown>;
function fail(message: string): never { throw new RecordValidationError(message); }

function object(value: unknown, label: string): Fields {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return fail(`${label} must be an object`);
  return value as Fields;
}

function keys(value: Fields, allowed: readonly string[], label: string): void {
  for (const key of Object.keys(value)) {
    if (key === 'warning' || key === 'warnings') fail('Safety warnings must be resolved before saving');
    if (!allowed.includes(key)) fail(`Unknown ${label} field: ${key}`);
  }
}

function code(value: unknown, allowed: readonly unknown[], label: string): void {
  if (!allowed.includes(value)) fail(`Invalid ${label}`);
}

function text(value: unknown, label: string, required = true): void {
  if (value === undefined && !required) return;
  if (typeof value !== 'string' || (required && !value.trim())) fail(`Invalid ${label}`);
}

function number(value: unknown, label: string, min: number, max = Infinity, integer = false): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) fail(`Invalid ${label}`);
}

const PAIN_LOCATIONS = ['leftUpper', 'rightUpper', 'middle', 'leftLower', 'rightLower', 'whole'] as const;

function stringArray(value: unknown, label: string): void {
  if (!Array.isArray(value)) fail(`Invalid ${label}`);
  for (const entry of value) text(entry, label);
}

function details(kind: RecordKind, value: unknown): void {
  const fields = object(value, 'details');
  text(fields.note, 'note', false);
  switch (kind) {
    case 'food':
      keys(fields, ['meal', 'items', 'method', 'note'], 'food');
      code(fields.meal, ['breakfast', 'lunch', 'dinner', 'snack', 'drink', 'other'], 'meal');
      code(fields.method, ['manual', 'photo-food', 'photo-package', 'photo-nutrition', 'voice'], 'food method');
      if (!Array.isArray(fields.items) || fields.items.length === 0) fail('Food needs an item');
      for (const entry of fields.items) {
        const item = object(entry, 'food item');
        keys(item, ['name', 'quantity', 'unit', 'customUnit', 'tags', 'brand', 'ingredients', 'nutrition'], 'food item');
        text(item.name, 'food name');
        number(item.quantity, 'food quantity', Number.MIN_VALUE);
        code(item.unit, ['g', 'kg', 'ml', 'l', 'piece', 'portion', 'cup', 'tbsp', 'tsp', 'custom'], 'food unit');
        text(item.customUnit, 'custom unit', item.unit === 'custom');
        text(item.brand, 'brand', false);
        if (item.tags !== undefined) stringArray(item.tags, 'food tags');
        if (item.ingredients !== undefined) stringArray(item.ingredients, 'ingredients');
        if (item.nutrition !== undefined) {
          const nutrition = object(item.nutrition, 'nutrition');
          keys(nutrition, ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar'], 'nutrition');
          for (const [name, amount] of Object.entries(nutrition)) number(amount, name, 0);
        }
      }
      break;
    case 'bowel':
      keys(fields, ['stoolType', 'feeling', 'sensations', 'painLevel', 'painLocation', 'bloating', 'urgency', 'note'], 'bowel');
      code(fields.stoolType, [1, 2, 3, 4, 5, 6, 7, 'unknown'], 'stool type');
      code(fields.feeling, ['easy', 'normal', 'difficult', 'veryDifficult', 'unrecorded'], 'feeling');
      if (!Array.isArray(fields.sensations)) fail('Invalid sensations');
      for (const sensation of fields.sensations) code(sensation, ['bloating', 'pain', 'nausea', 'urgency', 'other'], 'sensation');
      if (new Set(fields.sensations).size !== fields.sensations.length) fail('Duplicate sensations');
      if (fields.painLevel !== undefined) number(fields.painLevel, 'pain level', 0, 10, true);
      if (fields.painLocation !== undefined) code(fields.painLocation, PAIN_LOCATIONS, 'pain location');
      if (fields.bloating !== undefined) code(fields.bloating, ['mild', 'moderate', 'severe'], 'bloating');
      if (fields.urgency !== undefined) code(fields.urgency, ['some', 'urgent', 'nearMiss'], 'urgency');
      break;
    case 'symptom':
      keys(fields, ['symptoms', 'startedAt', 'durationMinutes', 'note'], 'symptom');
      if (!Array.isArray(fields.symptoms) || fields.symptoms.length === 0) fail('Choose a symptom');
      for (const entry of fields.symptoms) {
        const symptom = object(entry, 'symptom entry');
        keys(symptom, ['code', 'severity', 'painLevel', 'painLocation', 'vomiting'], 'symptom entry');
        code(symptom.code, ['bloating', 'pain', 'nausea', 'heartburn', 'gas', 'frequency', 'other'], 'symptom');
        code(symptom.severity, ['mild', 'moderate', 'severe'], 'severity');
        if (symptom.painLevel !== undefined) number(symptom.painLevel, 'pain level', 0, 10, true);
        if (symptom.painLocation !== undefined) code(symptom.painLocation, PAIN_LOCATIONS, 'pain location');
        if (symptom.vomiting !== undefined && typeof symptom.vomiting !== 'boolean') fail('Invalid vomiting value');
      }
      if (fields.startedAt !== undefined && !isIsoTimestamp(fields.startedAt)) fail('Invalid symptom start time');
      if (fields.durationMinutes !== undefined) number(fields.durationMinutes, 'symptom duration', 0, Infinity, true);
      break;
    case 'water':
      keys(fields, ['beverage', 'customName', 'volumeMl', 'note'], 'water');
      code(fields.beverage, ['water', 'coffee', 'tea', 'juice', 'milk', 'soda', 'alcohol', 'other'], 'beverage');
      text(fields.customName, 'beverage name', false);
      number(fields.volumeMl, 'volume', 1, Infinity, true);
      break;
    case 'exercise':
      keys(fields, ['activity', 'durationMinutes', 'intensity', 'distanceKm', 'steps', 'trainingType', 'customActivity', 'note'], 'exercise');
      code(fields.activity, ['walking', 'running', 'cycling', 'strength', 'yoga', 'swimming', 'ball', 'other'], 'activity');
      number(fields.durationMinutes, 'duration', 1, Infinity, true);
      code(fields.intensity, ['light', 'moderate', 'vigorous'], 'intensity');
      if (fields.distanceKm !== undefined) number(fields.distanceKm, 'distance', 0);
      if (fields.steps !== undefined) number(fields.steps, 'steps', 0, Infinity, true);
      if (fields.trainingType !== undefined) code(fields.trainingType, ['cardio', 'strength', 'flexibility', 'other'], 'training type');
      text(fields.customActivity, 'custom activity', false);
      break;
    case 'sleep':
      keys(fields, ['startedAt', 'endedAt', 'quality', 'awakenings', 'energy', 'note'], 'sleep');
      if (!isIsoTimestamp(fields.startedAt) || !isIsoTimestamp(fields.endedAt) || Date.parse(fields.endedAt) <= Date.parse(fields.startedAt)) fail('Invalid sleep interval');
      code(fields.quality, ['poor', 'fair', 'good', 'great'], 'sleep quality');
      if (fields.awakenings !== undefined) code(fields.awakenings, [0, 1, 2, 3], 'awakenings');
      if (fields.energy !== undefined) code(fields.energy, ['exhausted', 'normal', 'refreshed', 'energized'], 'morning energy');
      break;
  }
}

function event(value: Fields): void {
  code(value.kind, RECORD_KINDS, 'record kind');
  if (!isIsoTimestamp(value.occurredAt)) fail('Invalid event timestamp');
  if (!isLocalDate(value.localDate)) fail('Invalid local date');
  text(value.timeZone, 'time zone');
  try {
    if (dateKeyInTimeZone(value.occurredAt, value.timeZone as string) !== value.localDate) fail('Local date does not match the event time zone');
  } catch (error) {
    if (error instanceof RecordValidationError) throw error;
    fail('Invalid time zone');
  }
  details(value.kind as RecordKind, value.details);
  // Sleep belongs to the wake-up day, including intervals spanning midnight.
  if (value.kind === 'sleep') {
    const sleep = object(value.details, 'details');
    if (Date.parse(sleep.endedAt as string) !== Date.parse(value.occurredAt)) fail('Sleep event time must be its end time');
  }
}

export function validateRecordDraft(value: unknown): asserts value is RecordDraft {
  const fields = object(value, 'record draft');
  keys(fields, ['kind', 'occurredAt', 'localDate', 'timeZone', 'details'], 'record draft');
  event(fields);
}

export function validateDiaryRecord(value: unknown): asserts value is DiaryRecord {
  const fields = object(value, 'record');
  keys(fields, ['id', 'kind', 'occurredAt', 'localDate', 'timeZone', 'createdAt', 'updatedAt', 'schemaVersion', 'details'], 'record');
  text(fields.id, 'record id');
  if (fields.schemaVersion !== 1) fail('Unsupported record schema version');
  if (!isIsoTimestamp(fields.createdAt) || !isIsoTimestamp(fields.updatedAt) || Date.parse(fields.updatedAt) < Date.parse(fields.createdAt)) fail('Invalid record timestamps');
  event(fields);
}
