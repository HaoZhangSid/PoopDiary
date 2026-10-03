import { useEffect, useState } from 'react';
import { BackHandler, Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Screen, useTheme } from '@/design-system';
import { usesEmergencyCopy, type WarningSign } from '../model';

interface Props { warning: WarningSign; onBack: () => void }

export function SafetyStopScreen({ warning, onBack }: Props) {
  const theme = useTheme();
  const { t } = useTranslation('bowel');
  const [callFailed, setCallFailed] = useState(false);
  const emergency = usesEmergencyCopy(warning);

  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => { onBack(); return true; });
    return () => listener.remove();
  }, [onBack]);

  const openPhone = async () => {
    setCallFailed(false);
    try {
      await Linking.openURL('tel:112');
    } catch {
      setCallFailed(true);
    }
  };

  return (
    <Screen title={t('safety.title')} onBack={onBack} backLabel={t('back')}>
      <View style={{ gap: theme.spacing.lg }} accessibilityLiveRegion="assertive">
        <Card>
          <View style={{ gap: theme.spacing.md }}>
            <AppText variant="sectionTitle">{t(`safety.signs.${warning}`)}</AppText>
            <AppText variant="label">{t(emergency ? 'safety.urgent' : 'safety.doctor')}</AppText>
            <AppText>{t(emergency ? 'safety.urgentCopy' : 'safety.doctorCopy')}</AppText>
          </View>
        </Card>
        {emergency && <Button label={t('safety.call')} variant="danger" onPress={() => void openPhone()} />}
        {callFailed && <AppText>{t('safety.callError')}</AppText>}
        <AppText tone="secondary">{t('safety.note')}</AppText>
        <Button label={t('safety.modify')} variant="secondary" onPress={onBack} />
      </View>
    </Screen>
  );
}
