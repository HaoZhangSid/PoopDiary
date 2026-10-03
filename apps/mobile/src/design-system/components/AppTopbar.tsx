import { Bell, Leaf } from 'lucide-react-native';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../ThemeProvider';
import { AppText } from './AppText';

/** Shared chrome for the non-flow surfaces. It mirrors the Web topbar so
 * Diary, Insights, Profile and Report keep the same visual anchor as Today. */
export function AppTopbar() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { t } = useTranslation('common');
  const horizontalPadding = width > 820 ? 0 : theme.spacing.md;
  return <View style={{ height: 76, width: '100%', maxWidth: theme.controls.contentWidth, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: horizontalPadding }}>
    <Pressable accessibilityRole="button" accessibilityLabel={t('appName')} onPress={() => router.replace('/')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderBottomLeftRadius: 2, backgroundColor: theme.colors.action.primary.background }}><Leaf size={15} color={theme.colors.action.primary.foreground} /></View>
      <AppText variant="label" style={{ fontSize: 19, lineHeight: 22, letterSpacing: -0.5 }}>{t('appName')}</AppText>
    </Pressable>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface.card }}>
        <View style={{ width: 6, height: 6, borderRadius: theme.radius.pill, backgroundColor: theme.colors.text.primary }} />
        <AppText variant="caption" tone="secondary" style={{ fontSize: 12, lineHeight: 14 }}>{t('aiInsightsOn')}</AppText>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('notifications', { defaultValue: 'Notifications' })} style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}><Bell size={18} color={theme.colors.text.secondary} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={t('profile')} onPress={() => router.push('/profile')} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.pill, backgroundColor: theme.colors.feedback.success.bg }}><AppText variant="label" style={{ fontSize: 12, lineHeight: 16, color: theme.colors.feedback.success.fg }}>ML</AppText></Pressable>
    </View>
  </View>;
}
