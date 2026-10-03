import { useLocalSearchParams } from 'expo-router';
import { SymptomEditorScreen } from '@/features/symptoms';

export default function SymptomRecordRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SymptomEditorScreen id={id} />;
}
