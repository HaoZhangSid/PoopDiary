import { Tabs } from 'expo-router';
import { BookOpen, House, Settings2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/design-system';

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation('common');
  return <Tabs screenOptions={{ headerShown: false,
    tabBarActiveTintColor: theme.colors.text.primary, tabBarInactiveTintColor: theme.colors.text.secondary,
    tabBarStyle: { backgroundColor: theme.colors.surface.card, borderTopColor: theme.colors.border.default },
    tabBarLabelStyle: theme.typography.caption,
  }}>
    <Tabs.Screen name="index" options={{ title: t('today'), tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
    <Tabs.Screen name="diary" options={{ title: t('diary'), tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }} />
    <Tabs.Screen name="profile" options={{ title: t('profile'), tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size} /> }} />
  </Tabs>;
}
