export const RECORD_KINDS = ['food', 'bowel', 'symptom', 'water', 'exercise', 'sleep'] as const;
export type RecordKind = (typeof RECORD_KINDS)[number];
export type Severity = 'mild' | 'moderate' | 'severe';
export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type PainLocation = 'leftUpper' | 'rightUpper' | 'middle' | 'leftLower' | 'rightLower' | 'whole';
export type FoodUnit = 'g' | 'kg' | 'ml' | 'l' | 'piece' | 'portion' | 'cup' | 'tbsp' | 'tsp' | 'custom';

export interface FoodItem {
  name: string;
  quantity: number;
  unit: FoodUnit;
  customUnit?: string;
  tags?: string[];
  brand?: string;
  ingredients?: string[];
  nutrition?: { calories?: number; protein?: number; carbs?: number; fat?: number; fiber?: number; sugar?: number };
}

export interface FoodDetails {
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink' | 'other';
  items: FoodItem[];
  method: 'manual' | 'photo-food' | 'photo-package' | 'photo-nutrition' | 'voice';
  note?: string;
}

export interface BowelDetails {
  stoolType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'unknown';
  feeling: 'easy' | 'normal' | 'difficult' | 'veryDifficult' | 'unrecorded';
  sensations: ('bloating' | 'pain' | 'nausea' | 'urgency' | 'other')[];
  painLevel?: PainLevel;
  painLocation?: PainLocation;
  bloating?: Severity;
  urgency?: 'some' | 'urgent' | 'nearMiss';
  note?: string;
}

export interface SymptomEntry {
  code: 'bloating' | 'pain' | 'nausea' | 'heartburn' | 'gas' | 'frequency' | 'other';
  severity: Severity;
  painLevel?: PainLevel;
  painLocation?: PainLocation;
  vomiting?: boolean;
}

export interface SymptomDetails {
  symptoms: SymptomEntry[];
  startedAt?: string;
  durationMinutes?: number;
  note?: string;
}

export interface WaterDetails {
  beverage: 'water' | 'coffee' | 'tea' | 'juice' | 'milk' | 'soda' | 'alcohol' | 'other';
  customName?: string;
  volumeMl: number;
  note?: string;
}

export interface ExerciseDetails {
  activity: 'walking' | 'running' | 'cycling' | 'strength' | 'yoga' | 'swimming' | 'ball' | 'other';
  durationMinutes: number;
  intensity: 'light' | 'moderate' | 'vigorous';
  distanceKm?: number;
  steps?: number;
  trainingType?: 'cardio' | 'strength' | 'flexibility' | 'other';
  customActivity?: string;
  note?: string;
}

export interface SleepDetails {
  startedAt: string;
  endedAt: string;
  quality: 'poor' | 'fair' | 'good' | 'great';
  awakenings?: 0 | 1 | 2 | 3;
  energy?: 'exhausted' | 'normal' | 'refreshed' | 'energized';
  note?: string;
}

export interface RecordDetailsByKind {
  food: FoodDetails;
  bowel: BowelDetails;
  symptom: SymptomDetails;
  water: WaterDetails;
  exercise: ExerciseDetails;
  sleep: SleepDetails;
}

export interface RecordEvent {
  occurredAt: string;
  localDate: string;
  timeZone: string;
}

export interface RecordMetadata {
  id: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: 1;
}

export type RecordDraft = {
  [K in RecordKind]: RecordEvent & { kind: K; details: RecordDetailsByKind[K] };
}[RecordKind];

export type DiaryRecord = {
  [K in RecordKind]: RecordEvent & RecordMetadata & { kind: K; details: RecordDetailsByKind[K] };
}[RecordKind];

export type BowelRecord = Extract<DiaryRecord, { kind: 'bowel' }>;
