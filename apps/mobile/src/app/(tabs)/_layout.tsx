import { Tabs } from 'expo-router';
import { BookOpen, HeartPulse, Settings2 } from 'lucide-react-native';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/design-system';

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const dockWidth = Math.min(width - theme.spacing.md * 2, theme.controls.minimumTouchTarget * 8);
  const dockHeight = Math.max(theme.controls.minimumTouchTarget + theme.spacing.lg, theme.controls.icon + Number(theme.typography.caption.lineHeight) * fontScale + theme.spacing.lg);
  return <Tabs screenOptions={{ headerShown: false,
    tabBarActiveTintColor: theme.colors.text.primary, tabBarInactiveTintColor: theme.colors.text.secondary,
    tabBarActiveBackgroundColor: theme.colors.surface.subtle,
    tabBarStyle: { position: 'absolute', width: dockWidth, left: (width - dockWidth) / 2, bottom: insets.bottom + theme.spacing.md, height: dockHeight, padding: theme.spacing.sm, backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.default, borderWidth: theme.controls.borderWidth, borderRadius: theme.radius.lg },
    tabBarItemStyle: { borderRadius: theme.radius.md, padding: 0 },
    tabBarLabelPosition: 'below-icon',
    tabBarLabelStyle: theme.typography.caption,
    sceneStyle: { paddingBottom: dockHeight + insets.bottom + theme.spacing.md * 2, backgroundColor: theme.colors.surface.canvas },
  }}>
    <Tabs.Screen name="index" options={{ title: t('today'), tabBarIcon: ({ color, size }) => <HeartPulse color={color} size={size} /> }} />
    <Tabs.Screen name="diary" options={{ title: t('diary'), tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }} />
    <Tabs.Screen name="profile" options={{ title: t('profile'), tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size} /> }} />
  </Tabs>;
}
