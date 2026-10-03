import type { Entry } from './types'

export type StoolZone = 'hard' | 'ideal' | 'loose'

export const zoneOf = (type: number): StoolZone => type <= 2 ? 'hard' : type <= 4 ? 'ideal' : 'loose'

const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function entriesForRange(entries: Entry[], today: string, days: number) {
  const from = new Date(`${today}T12:00:00`)
  from.setDate(from.getDate() - days + 1)
  const start = dayKey(from)
  return entries.filter((entry) => entry.date >= start && entry.date <= today)
}

export function summarizeEntries(entries: Entry[], today: string, days: number) {
  const rangeEntries = entriesForRange(entries, today, days)
  const bowel = rangeEntries.filter((entry) => entry.kind === 'bowel')
  const symptoms = rangeEntries.filter((entry) => entry.kind === 'symptom')
  const meals = rangeEntries.filter((entry) => entry.kind === 'meal')
  const types = [1, 2, 3, 4, 5, 6, 7].map((type) => bowel.filter((entry) => Number(entry.details.type) === type).length)
  const zones = bowel.reduce<Record<StoolZone, number>>((acc, entry) => {
    const zone = zoneOf(Number(entry.details.type) || 0)
    acc[zone] += 1
    return acc
  }, { hard: 0, ideal: 0, loose: 0 })
  const dairyMeals = meals.filter((entry) => /酸奶|牛奶|奶酪|乳制品|dairy/i.test(`${entry.title} ${entry.summary}`))
  const isBloatingEntry = (entry: Entry) => entry.kind === 'symptom'
    ? /腹胀|bloating/i.test(`${entry.title} ${entry.summary}`)
    : entry.kind === 'bowel' && Array.isArray(entry.details.sensations) && entry.details.sensations.some((value) => /腹胀|bloating/i.test(String(value)))
  const bloatingEntries = rangeEntries.filter(isBloatingEntry)
  const minutesOf = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : NaN
  }
  const mealForBloating = new Map<string, Entry>()
  bloatingEntries.forEach((bloating) => {
    const bloatingMinutes = minutesOf(bloating.time)
    const candidate = meals
      .filter((meal) => meal.date === bloating.date)
      .filter((meal) => {
        const mealMinutes = minutesOf(meal.time)
        return Number.isFinite(mealMinutes) && Number.isFinite(bloatingMinutes) && mealMinutes <= bloatingMinutes && bloatingMinutes - mealMinutes <= 360
      })
      .sort((a, b) => minutesOf(b.time) - minutesOf(a.time))[0]
    if (candidate) mealForBloating.set(bloating.id, candidate)
  })
  const hasBloatingAfter = (meal: Entry) => [...mealForBloating.values()].some((candidate) => candidate.id === meal.id)
  const dairyAssociatedMeals = dairyMeals.filter(hasBloatingAfter)
  const nonDairyMeals = meals.filter((entry) => !dairyMeals.includes(entry))
  const nonDairyAssociatedMeals = nonDairyMeals.filter(hasBloatingAfter)
  const dairyAssociatedBloating = bloatingEntries.filter((entry) => dairyMeals.some((meal) => meal.id === mealForBloating.get(entry.id)?.id))
  return { rangeEntries, bowel, symptoms, meals, types, zones, dairyMeals, dairyAssociatedMeals, nonDairyMeals, nonDairyAssociatedMeals, bloatingEntries, dairyAssociatedBloating, bloating: bloatingEntries.length, loggedDays: new Set(rangeEntries.map((entry) => entry.date)).size }
}
