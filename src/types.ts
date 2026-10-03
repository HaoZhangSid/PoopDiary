export type EntryKind = 'meal' | 'bowel' | 'symptom' | 'water' | 'exercise' | 'sleep'
export type Language = 'zh' | 'en' | 'fi'

export type SymptomRecord = {
  name: string
  severity: number
}

export type Entry = {
  id: string
  kind: EntryKind
  date: string
  time: string
  title: string
  summary: string
  details: Record<string, string | number | boolean | string[] | SymptomRecord[] | undefined>
}

export type Settings = {
  name: string
  email: string
  language: Language
  tracking: Record<EntryKind, boolean>
  aiInsights: boolean
  dailyReminder: boolean
  weeklyReport: boolean
  appearance: 'light' | 'dark' | 'system'
}
