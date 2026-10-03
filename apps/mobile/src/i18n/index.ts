import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import fi from './locales/fi';
import zh from './locales/zh';
import enBowel from '@/features/bowel/messages/en';
import fiBowel from '@/features/bowel/messages/fi';
import zhBowel from '@/features/bowel/messages/zh';
import enWater from '@/features/water/messages/en';
import fiWater from '@/features/water/messages/fi';
import zhWater from '@/features/water/messages/zh';
import enSymptom from '@/features/symptoms/messages/en';
import fiSymptom from '@/features/symptoms/messages/fi';
import zhSymptom from '@/features/symptoms/messages/zh';

export const resources = {
  en: { ...en, bowel: enBowel, water: enWater, symptom: enSymptom },
  fi: { ...fi, bowel: fiBowel, water: fiWater, symptom: fiSymptom },
  zh: { ...zh, bowel: zhBowel, water: zhWater, symptom: zhSymptom },
};

const i18n = createInstance();
void i18n.use(initReactI18next).init({
  resources, lng: 'en', fallbackLng: 'en', supportedLngs: ['en', 'fi', 'zh'],
  defaultNS: 'common', interpolation: { escapeValue: false },
  react: { useSuspense: false },
});
export default i18n;
