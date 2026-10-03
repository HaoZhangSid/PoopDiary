import type { Entry, Settings } from './types'

const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const TODAY = localDateKey(new Date())

export const initialSettings: Settings = {
  name: 'Mira Laitinen',
  email: 'mira@example.com',
  language: 'zh',
  tracking: { meal: true, bowel: true, symptom: true, water: true, exercise: true, sleep: true },
  aiInsights: true,
  dailyReminder: true,
  weeklyReport: false,
  appearance: 'light',
}

export const initialEntries: Entry[] = [
  {
    id: 'seed-meal', kind: 'meal', date: TODAY, time: '08:00', title: '早餐', summary: '燕麦粥 + 香蕉',
    details: { foods: ['燕麦粥', '香蕉'], meal: '早餐', source: 'voice' },
  },
  {
    id: 'seed-bowel', kind: 'bowel', date: TODAY, time: '08:45', title: '排便 · Type 1', summary: '有点困难 · 腹胀',
    details: { type: '1', feeling: '有点困难', sensations: ['腹胀'], bloating: '轻微' },
  },
  {
    id: 'seed-symptom', kind: 'symptom', date: TODAY, time: '09:10', title: '轻微腹胀', summary: '刚刚开始 · 持续 <30分钟',
    details: { symptom: '腹胀', severity: '轻微', onset: '刚刚', duration: '<30分钟' },
  },
  {
    id: 'seed-water', kind: 'water', date: TODAY, time: '10:15', title: '饮水', summary: '500 ml · 水',
    details: { amount: 500, beverage: '水' },
  },
  {
    id: 'seed-sleep', kind: 'sleep', date: TODAY, time: '07:00', title: '睡眠', summary: '7小时30分 · 不错',
    details: { hours: 7, minutes: 30, quality: '不错', awakenings: '1', wakingFeeling: '精神不错', bed: '23:30', wake: '07:00' },
  },
]

const demoDate = (offset: number) => {
  const date = new Date(`${TODAY}T12:00:00`)
  date.setDate(date.getDate() + offset)
  return localDateKey(date)
}

export const demoEntries = (): Entry[] => Array.from({ length: 14 }, (_, index) => {
  const date = demoDate(index - 13)
  const type = String([3, 4, 4, 5, 4, 2, 3, 4, 5, 4, 4, 1, 3, 4][index])
  const dairy = index % 3 === 0
  const mealFoods = dairy ? ['酸奶', '燕麦'] : index % 2 ? ['米饭', '鸡肉'] : ['燕麦粥', '香蕉']
  const entries: Entry[] = [
    { id: `demo-bowel-${index}`, kind: 'bowel', date, time: index % 2 ? '08:25' : '09:10', title: `排便 · Type ${type}`, summary: Number(type) <= 2 ? '偏硬 · 有点困难' : Number(type) >= 5 ? '偏稀 · 正常' : '理想区 · 正常', details: { type, feeling: Number(type) <= 2 ? '有点困难' : '正常', sensations: Number(type) >= 5 ? ['腹胀'] : [] } },
    { id: `demo-meal-${index}`, kind: 'meal', date, time: '08:00', title: '早餐', summary: mealFoods.join(' + '), details: { foods: mealFoods, meal: '早餐', source: 'demo' } },
    { id: `demo-water-${index}`, kind: 'water', date, time: '12:30', title: '饮水', summary: `${index % 2 ? 750 : 1000} ml · 水`, details: { amount: index % 2 ? 750 : 1000, beverage: '水' } },
  ]
  if (dairy || index % 4 === 1) entries.push({ id: `demo-symptom-${index}`, kind: 'symptom', date, time: '10:40', title: '轻微腹胀', summary: dairy ? '轻微 · 今天早些时候' : '轻微 · 刚刚', details: { symptom: '腹胀', severity: '轻微', onset: '今天早些时候', duration: '<30分钟' } })
  if (index % 3 === 0) entries.push({ id: `demo-sleep-${index}`, kind: 'sleep', date, time: '07:00', title: '睡眠', summary: '7小时30分 · 不错', details: { hours: 7, minutes: 30, quality: '不错', awakenings: '1', wakingFeeling: '精神不错', bed: '23:30', wake: '07:00' } })
  return entries
}).flat()

export const foodLibrary = ['燕麦', '燕麦粥', '香蕉', '咖啡', '鸡蛋', '酸奶', '米饭', '鸡肉', '西兰花', '吐司', '苹果', '牛奶']

export const iconForKind = (kind: Entry['kind']) => ({
  meal: 'Utensils', bowel: 'CircleDot', symptom: 'Activity', water: 'Droplets', exercise: 'Dumbbell', sleep: 'Moon',
}[kind])
