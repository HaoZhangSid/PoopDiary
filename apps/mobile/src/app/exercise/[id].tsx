import { useLocalSearchParams } from 'expo-router';
import { ExerciseEditorScreen } from '@/features/exercise';

export default function EditExerciseRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ExerciseEditorScreen id={id} />;
}
