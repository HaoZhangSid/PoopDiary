import { useLocalSearchParams } from 'expo-router';
import { BowelEditorScreen } from '@/features/bowel';
import { FoodEditorScreen } from '@/features/food';
import { ExerciseEditorScreen } from '@/features/exercise';
import { SleepEditorScreen } from '@/features/sleep';
import { SymptomEditorScreen } from '@/features/symptoms';
import { WaterEditorScreen } from '@/features/water';

/** Compatibility route: the Web prototype uses /log/:kind; keep that URL
 * working while the native-first routes remain /food, /bowel, etc. */
export default function LogKindRoute() {
  const { kind, edit, quick } = useLocalSearchParams<{ kind: string; edit?: string; quick?: string }>();
  const id = typeof edit === 'string' ? edit : undefined;
  if (kind === 'food') return <FoodEditorScreen id={id} quick={quick === '1'} />;
  if (kind === 'bowel') return <BowelEditorScreen id={id} />;
  if (kind === 'symptom') return <SymptomEditorScreen id={id} quick={quick === '1'} />;
  if (kind === 'water') return <WaterEditorScreen id={id} quick={quick === '1'} />;
  if (kind === 'exercise') return <ExerciseEditorScreen id={id} quick={quick === '1'} />;
  if (kind === 'sleep') return <SleepEditorScreen id={id} quick={quick === '1'} />;
  return null;
}
