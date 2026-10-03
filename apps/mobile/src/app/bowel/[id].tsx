import { useLocalSearchParams } from 'expo-router';
import { BowelEditorScreen } from '@/features/bowel';
export default function EditBowelRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BowelEditorScreen id={id} />;
}
