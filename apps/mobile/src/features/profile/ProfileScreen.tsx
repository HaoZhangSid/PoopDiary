import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Choice, Screen, useTheme } from '@/design-system';
import { useAppStore } from '@/state/useAppStore';

export function ProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation('profile');
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = async (patch: Parameters<typeof updateSettings>[0]) => {
    if (busy) return;
    setBusy(true); setError('');
    try { await updateSettings(patch); } catch { setError(t('settingsError')); }
    finally { setBusy(false); }
  };
  return <Screen title={t('title')}>
    <Card><AppText variant="sectionTitle" accessibilityRole="header">{t('language')}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{(['en', 'fi', 'zh'] as const).map((code) => <View key={code} style={{ flexBasis: '28%', flexGrow: 1, minWidth: theme.controls.minimumTouchTarget * 2 }}><Choice density="compact" style={{ flex: 1 }} label={{ en: 'English', fi: 'Suomi', zh: '中文' }[code]} selected={settings.language === code} disabled={busy} onPress={() => { void change({ language: code }); }} /></View>)}</View>
    </Card>
    <Card><AppText variant="sectionTitle" accessibilityRole="header">{t('appearance')}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{(['light', 'dark', 'system'] as const).map((appearance) => <View key={appearance} style={{ flexBasis: '28%', flexGrow: 1, minWidth: theme.controls.minimumTouchTarget * 2 }}><Choice density="compact" style={{ flex: 1 }} label={t(appearance)} selected={settings.appearance === appearance} disabled={busy} onPress={() => { void change({ appearance }); }} /></View>)}</View>
    </Card>
    {Boolean(error) && <AppText tone="danger">{error}</AppText>}
    <Button variant="secondary" label={t('components')} onPress={() => router.push('/components')} />
    <View style={{ padding: theme.spacing.sm }}><AppText variant="caption" tone="secondary">{t('localData')}</AppText></View>
  </Screen>;
}
