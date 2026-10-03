import { useLocalSearchParams } from 'expo-router';
import { SleepEditorScreen } from '@/features/sleep';

export default function EditSleepRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SleepEditorScreen id={id} />;
}
