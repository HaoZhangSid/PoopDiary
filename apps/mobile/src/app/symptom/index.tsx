import { useLocalSearchParams } from 'expo-router';
import { SymptomEditorScreen } from '@/features/symptoms';

export default function SymptomRoute() {
  const { quick } = useLocalSearchParams<{ quick?: string }>();
  return <SymptomEditorScreen quick={quick === '1'} />;
}
