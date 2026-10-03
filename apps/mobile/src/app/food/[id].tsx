import { useLocalSearchParams } from 'expo-router';
import { FoodEditorScreen } from '@/features/food';
export default function EditFoodRoute() { const { id } = useLocalSearchParams<{ id: string }>(); return <FoodEditorScreen id={id} />; }
