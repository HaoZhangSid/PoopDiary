import { useLocalSearchParams } from 'expo-router';
import { SleepEditorScreen } from '@/features/sleep';

export default function SleepRoute() {
  const { quick } = useLocalSearchParams<{ quick?: string }>();
  return <SleepEditorScreen quick={quick === '1'} />;
}
