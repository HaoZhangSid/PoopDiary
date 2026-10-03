import { useLocalSearchParams } from 'expo-router';
import { FoodEditorScreen } from '@/features/food';

export default function FoodRoute() {
  const { quick } = useLocalSearchParams<{ quick?: string }>();
  return <FoodEditorScreen quick={quick === '1'} />;
}
