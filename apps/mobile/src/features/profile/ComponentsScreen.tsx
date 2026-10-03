import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Choice, Screen, Sheet, Slider, Stepper, useTheme } from '@/design-system';
import { useFeedbackStore } from '@/state/useFeedbackStore';

export function ComponentsScreen() {
  const { t } = useTranslation(['components', 'common']);
  const theme = useTheme();
  const [selected, setSelected] = useState(true);
  const [value, setValue] = useState(4);
  const [count, setCount] = useState(1);
  const [sheet, setSheet] = useState(false);
  return <Screen title={t('title')} onBack={() => router.back()} backLabel={t('back', { ns: 'common' })}>
    <Card><AppText variant="sectionTitle">{t('buttons')}</AppText>
      <Button label={t('save', { ns: 'common' })} onPress={() => useFeedbackStore.getState().show(t('saved', { ns: 'common' }))} />
      <Button variant="secondary" label={t('edit', { ns: 'common' })} onPress={() => setSheet(true)} />
      <Button variant="danger" label={t('delete', { ns: 'common' })} onPress={() => setSheet(true)} />
      <Button label={t('loading')} loading onPress={() => undefined} />
      <Button label={t('disabled')} disabled onPress={() => undefined} />
    </Card>
    <Card><AppText variant="sectionTitle">{t('choices')}</AppText>
      <Choice label={t('longText')} selectionRole="checkbox" selected={selected} onPress={() => setSelected(!selected)} />
      {(['mild', 'moderate', 'severe'] as const).map((level) => <Choice key={level} label={t(`severities.${level}`, { ns: 'bowel' })} tone={level} selected={value === ['mild', 'moderate', 'severe'].indexOf(level)} onPress={() => setValue(['mild', 'moderate', 'severe'].indexOf(level))} />)}
    </Card>
    <Card><AppText variant="sectionTitle">{t('slider')}</AppText><AppText>{value} / 10</AppText><Slider label={t('amount')} value={value} onValueChange={setValue} minimumValue={0} maximumValue={10} step={1} /></Card>
    <Card><AppText variant="sectionTitle">{t('stepper')}</AppText><Stepper value={count} onChange={setCount} min={0} max={10} decreaseLabel={t('decrease')} increaseLabel={t('increase')} /></Card>
    <View style={{ backgroundColor: theme.colors.feedback.danger.bg, borderRadius: theme.radius.md, padding: theme.spacing.md }} accessibilityRole="alert"><AppText variant="label" style={{ color: theme.colors.feedback.danger.fg }}>{t('error')}</AppText><AppText style={{ color: theme.colors.feedback.danger.fg }}>{t('errorDetail')}</AppText></View>
    <Button variant="secondary" label={t('openSheet')} onPress={() => setSheet(true)} />
    <Sheet visible={sheet} title={t('sheet')} closeLabel={t('close', { ns: 'common' })} onClose={() => setSheet(false)}>
      <AppText>{t('longText')}</AppText><Button label={t('close', { ns: 'common' })} onPress={() => setSheet(false)} />
    </Sheet>
  </Screen>;
}
