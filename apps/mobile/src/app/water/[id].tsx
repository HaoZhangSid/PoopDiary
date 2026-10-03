import { useLocalSearchParams } from 'expo-router';
import { WaterEditorScreen } from '@/features/water';

export default function EditWaterRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WaterEditorScreen id={id} />;
}
