import { Tabs, useRouter } from 'expo-router';
import { BarChart3, BookOpen, HeartPulse, Plus, Settings2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { AppText, Sheet, useTheme } from '@/design-system';
import { useState } from 'react';

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const insets = useSafeAreaInsets();
  const dockHeight = theme.controls.minimumTouchTarget + theme.spacing.sm * 2;
  const dockBottom = insets.bottom + theme.spacing.md;
  const [logOpen, setLogOpen] = useState(false);
  return <>
    <Tabs
      tabBar={(props) => <BottomDock {...props} onLog={() => setLogOpen(true)} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { paddingBottom: dockHeight + dockBottom + theme.spacing.md, backgroundColor: theme.colors.surface.canvas },
        tabBarStyle: { height: dockHeight + dockBottom },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('today') }} />
      <Tabs.Screen name="diary" options={{ title: t('diary') }} />
      <Tabs.Screen name="insights" options={{ title: t('insights') }} />
      <Tabs.Screen name="profile" options={{ title: t('profile') }} />
    </Tabs>
    <LogSheet visible={logOpen} onClose={() => setLogOpen(false)} />
  </>;
}

/**
 * The Web prototype uses a floating five-slot dock rather than a platform
 * default tab bar. Keeping it custom makes the native port match the source
 * layout on both narrow phones and Expo Web.
 */
function BottomDock({ state, navigation, insets, onLog }: BottomTabBarProps & { onLog: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const { width } = useWindowDimensions();
  const dockInset = theme.spacing.sm + theme.spacing.xs + theme.controls.borderWidth;
  const dockWidth = Math.min(theme.controls.minimumTouchTarget * 8 + theme.spacing.xs, Math.max(0, width - dockInset * 2));
  const tabs = [
    { route: 'index', label: t('today'), icon: HeartPulse },
    { route: 'diary', label: t('diary'), icon: BookOpen },
    { route: 'insights', label: t('insights'), icon: BarChart3 },
    { route: 'profile', label: t('profile'), icon: Settings2 },
  ] as const;
  const byRoute = new Map(state.routes.map((route) => [route.name, route]));
  const navigate = (name: string) => {
    const route = byRoute.get(name);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(route.name);
  };
  const isFocused = (name: string) => state.routes[state.index]?.name === name;
  const iconColor = theme.colors.text.secondary;
  const addBackground = theme.colors.entry.symptom.fg;
  const addForeground = theme.isDark ? theme.colors.surface.canvas : theme.colors.surface.card;
  return <View style={[styles.dockWrap, { bottom: insets.bottom + theme.spacing.md, width: dockWidth }]}>
    <View style={[styles.dock, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.default, borderRadius: theme.radius.lg, borderWidth: theme.controls.borderWidth, padding: theme.spacing.sm, shadowColor: theme.colors.text.primary }]}>
      <DockTab label={tabs[0].label} icon={tabs[0].icon} active={isFocused('index')} color={iconColor} activeColor={theme.colors.text.primary} activeBackground={theme.colors.surface.subtle} onPress={() => navigate('index')} />
      <DockTab label={tabs[1].label} icon={tabs[1].icon} active={isFocused('diary')} color={iconColor} activeColor={theme.colors.text.primary} activeBackground={theme.colors.surface.subtle} onPress={() => navigate('diary')} />
      <Pressable accessibilityRole="button" accessibilityLabel={t('log')} onPress={onLog} style={({ pressed }) => [styles.add, { width: theme.controls.minimumTouchTarget + theme.spacing.xs, height: theme.controls.minimumTouchTarget + theme.spacing.xs, marginTop: -(theme.spacing.md + theme.spacing.xs), marginHorizontal: theme.controls.borderWidth, borderWidth: theme.spacing.xs + theme.controls.borderWidth, borderRadius: theme.radius.lg, backgroundColor: addBackground, borderColor: theme.colors.surface.canvas, shadowColor: addBackground }, pressed && styles.addPressed]}>
        <Plus size={theme.controls.icon + theme.spacing.xs} color={addForeground} strokeWidth={2.4} />
        <Text style={[styles.addLabel, { color: addForeground, fontSize: theme.spacing.sm + theme.spacing.xs, lineHeight: theme.spacing.sm + theme.spacing.xs }]}>{t('log')}</Text>
      </Pressable>
      <DockTab label={tabs[2].label} icon={tabs[2].icon} active={isFocused('insights')} color={iconColor} activeColor={theme.colors.text.primary} activeBackground={theme.colors.surface.subtle} onPress={() => navigate('insights')} />
      <DockTab label={tabs[3].label} icon={tabs[3].icon} active={isFocused('profile')} color={iconColor} activeColor={theme.colors.text.primary} activeBackground={theme.colors.surface.subtle} onPress={() => navigate('profile')} />
    </View>
  </View>;
}

function LogSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('common');
  const options = [
    { label: t('food', { ns: 'common' }), path: '/food' as const },
    { label: t('bowel'), path: '/bowel' as const },
    { label: t('water'), path: '/water' as const },
    { label: t('symptom'), path: '/symptom' as const },
    { label: t('exercise', { ns: 'common' }), path: '/exercise' as const },
    { label: t('sleep', { ns: 'common' }), path: '/sleep' as const },
  ];
  return <Sheet visible={visible} title={t('log')} onClose={onClose}>
    {options.map((option) => <Pressable key={option.path} accessibilityRole="button" accessibilityLabel={option.label} onPress={() => { onClose(); router.push(option.path); }} style={({ pressed }) => [{ minHeight: theme.controls.minimumTouchTarget, justifyContent: 'center', paddingHorizontal: theme.spacing.md, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, backgroundColor: pressed ? theme.colors.surface.subtle : theme.colors.surface.canvas, borderRadius: theme.radius.md }]}>
      <AppText variant="label">{option.label}</AppText>
    </Pressable>)}
  </Sheet>;
}

function DockTab({ label, icon: Icon, active, color, activeColor, activeBackground, onPress }: { label: string; icon: typeof HeartPulse; active: boolean; color: string; activeColor: string; activeBackground: string; onPress: () => void }) {
  const theme = useTheme();
  return <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.tab, { minHeight: theme.controls.minimumTouchTarget, gap: theme.spacing.xs / 2, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.xs, borderRadius: theme.radius.md, backgroundColor: active ? activeBackground : 'transparent' }, pressed && styles.tabPressed]}>
    <Icon size={theme.controls.smallIcon + theme.controls.borderWidth * 2} color={active ? activeColor : color} strokeWidth={1.9} />
    <Text numberOfLines={1} style={[styles.tabLabel, { color: active ? activeColor : color, fontSize: theme.spacing.sm + theme.controls.borderWidth * 2, lineHeight: theme.spacing.md }]}>{label}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  dockWrap: { position: 'absolute', alignSelf: 'center', zIndex: 20 },
  dock: { flexDirection: 'row', alignItems: 'center', shadowOffset: { width: 0, height: 10 }, shadowRadius: 24, shadowOpacity: 0.13, elevation: 8 },
  tab: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center' },
  tabPressed: { opacity: 0.76 },
  add: { alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 8 }, shadowRadius: 18, shadowOpacity: 0.28, elevation: 5 },
  addPressed: { transform: [{ translateY: 2 }, { scale: 0.98 }] },
  addLabel: { fontWeight: '800' },
  tabLabel: { fontWeight: '700', textAlign: 'center' },
});
