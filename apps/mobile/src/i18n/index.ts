import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import fi from './locales/fi';
import zh from './locales/zh';
import enBowel from '@/features/bowel/messages/en';
import fiBowel from '@/features/bowel/messages/fi';
import zhBowel from '@/features/bowel/messages/zh';

export const resources = {
  en: { ...en, bowel: enBowel },
  fi: { ...fi, bowel: fiBowel },
  zh: { ...zh, bowel: zhBowel },
};

const i18n = createInstance();
void i18n.use(initReactI18next).init({
  resources, lng: 'en', fallbackLng: 'en', supportedLngs: ['en', 'fi', 'zh'],
  defaultNS: 'common', interpolation: { escapeValue: false },
  react: { useSuspense: false },
});
export default i18n;
