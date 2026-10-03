import { useTranslation } from 'react-i18next';
import { AppText, Screen, useTheme } from '@/design-system';

/** The Insights tab is reserved for the full native migration. Keep its navigation slot stable. */
export default function InsightsPlaceholderScreen() {
  const theme = useTheme();
  const { t } = useTranslation('common');
  return <Screen>
    <AppText variant="pageTitle">{t('insights')}</AppText>
    <AppText variant="body" tone="secondary" style={{ marginTop: theme.spacing.sm }}>Coming soon</AppText>
  </Screen>;
}
