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
import enExercise from '@/features/exercise/messages/en';
import fiExercise from '@/features/exercise/messages/fi';
import zhExercise from '@/features/exercise/messages/zh';
import enSleep from '@/features/sleep/messages/en';
import fiSleep from '@/features/sleep/messages/fi';
import zhSleep from '@/features/sleep/messages/zh';
import enFood from '@/features/food/messages/en';
import fiFood from '@/features/food/messages/fi';
import zhFood from '@/features/food/messages/zh';

export const resources = {
  en: { ...en, bowel: enBowel, water: enWater, symptom: enSymptom, exercise: enExercise, sleep: enSleep, food: enFood },
  fi: { ...fi, bowel: fiBowel, water: fiWater, symptom: fiSymptom, exercise: fiExercise, sleep: fiSleep, food: fiFood },
  zh: { ...zh, bowel: zhBowel, water: zhWater, symptom: zhSymptom, exercise: zhExercise, sleep: zhSleep, food: zhFood },
};

const i18n = createInstance();
void i18n.use(initReactI18next).init({
  resources, lng: 'en', fallbackLng: 'en', supportedLngs: ['en', 'fi', 'zh'],
  defaultNS: 'common', interpolation: { escapeValue: false },
  react: { useSuspense: false },
});
export default i18n;
