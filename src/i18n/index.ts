import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fi from './locales/fi.json'
import zh from './locales/zh.json'
import type { Language } from '../types'

export const languageOptions: { code: Language; label: string }[] = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'fi', label: 'Suomi' },
]

const readStoredLanguage = (): Language => {
  try {
    const stored = JSON.parse(localStorage.getItem('gutlog-settings') || 'null')
    return stored?.language === 'en' || stored?.language === 'fi' ? stored.language : 'zh'
  } catch {
    return 'zh'
  }
}

void i18next
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
      fi: { translation: fi },
    },
    lng: readStoredLanguage(),
    fallbackLng: 'zh',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

export const i18n = i18next
export const tx = (key: string, options?: Record<string, unknown>) => i18next.t(key, options)
