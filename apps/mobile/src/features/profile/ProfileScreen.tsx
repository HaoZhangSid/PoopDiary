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
      {(['en', 'fi', 'zh'] as const).map((code) => <Choice key={code} label={{ en: 'English', fi: 'Suomi', zh: '中文' }[code]} selected={settings.language === code} disabled={busy} onPress={() => { void change({ language: code }); }} />)}
    </Card>
    <Card><AppText variant="sectionTitle" accessibilityRole="header">{t('appearance')}</AppText>
      {(['light', 'dark', 'system'] as const).map((appearance) => <Choice key={appearance} label={t(appearance)} selected={settings.appearance === appearance} disabled={busy} onPress={() => { void change({ appearance }); }} />)}
    </Card>
    {Boolean(error) && <AppText tone="danger">{error}</AppText>}
    <Button variant="secondary" label={t('components')} onPress={() => router.push('/components')} />
    <View style={{ padding: theme.spacing.sm }}><AppText variant="caption" tone="secondary">{t('localData')}</AppText></View>
  </Screen>;
}
