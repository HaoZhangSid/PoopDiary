import { useEffect, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { AppText, Button, Screen, ThemeProvider } from '@/design-system';
import i18n from '@/i18n';
import { useAppStore } from '@/state/useAppStore';
import { FeedbackHost } from './FeedbackHost';

function Bootstrap({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common');
  const status = useAppStore((state) => state.status);
  const initialize = useAppStore((state) => state.initialize);
  const start = () => initialize().catch((error: unknown) => {
    if (__DEV__) console.error('Diary initialization failed', error);
  });
  useEffect(() => { void initialize().catch((error: unknown) => {
    if (__DEV__) console.error('Diary initialization failed', error);
  }); }, [initialize]);
  if (status !== 'ready') return <Screen title={t('appName')}>
    <AppText tone={status === 'error' ? 'danger' : 'secondary'}>{t(status === 'error' ? 'startupError' : 'loading')}</AppText>
    {status === 'error' && <Button label={t('retry')} onPress={() => { void start(); }} />}
  </Screen>;
  return <>{children}<FeedbackHost /></>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const settings = useAppStore((state) => state.settings);
  useEffect(() => { void i18n.changeLanguage(settings.language); }, [settings.language]);
  return <SafeAreaProvider><I18nextProvider i18n={i18n}>
    <ThemeProvider appearance={settings.appearance}><Bootstrap>{children}</Bootstrap></ThemeProvider>
  </I18nextProvider></SafeAreaProvider>;
}
