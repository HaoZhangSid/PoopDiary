import { useLocalSearchParams } from 'expo-router';
import { ExerciseEditorScreen } from '@/features/exercise';

export default function ExerciseRoute() {
  const { quick } = useLocalSearchParams<{ quick?: string }>();
  return <ExerciseEditorScreen quick={quick === '1'} />;
}
