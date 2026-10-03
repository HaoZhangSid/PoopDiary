import { useLocalSearchParams } from 'expo-router';
import { WaterEditorScreen } from '@/features/water';

export default function WaterRoute() {
  const { quick } = useLocalSearchParams<{ quick?: string }>();
  return <WaterEditorScreen quick={quick === '1'} />;
}
