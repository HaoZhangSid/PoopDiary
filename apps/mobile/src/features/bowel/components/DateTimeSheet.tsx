import { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Choice, Sheet, Stepper, useTheme } from '@/design-system';
import { currentTime, localDateKey } from '@/domain/records';
import { daysInMonth, updateDatePart } from '../model';

interface Props {
  visible: boolean;
  date: string;
  time: string;
  onClose: () => void;
  onApply: (date: string, time: string, forceTimeUpdate: boolean) => void;
}

export function DateTimeSheet({ visible, date, time, onClose, onApply }: Props) {
  if (!visible) return null;
  // Each opening gets a fresh, isolated draft; dismissing never changes the editor.
  return <DateTimeSheetContent visible date={date} time={time} onClose={onClose} onApply={onApply} />;
}

function DateTimeSheetContent({ visible, date, time, onClose, onApply }: Props) {
  const theme = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const { t } = useTranslation('bowel');
  const [draftDate, setDraftDate] = useState(date);
  const [draftTime, setDraftTime] = useState(time);
  const [forceTimeUpdate, setForceTimeUpdate] = useState(false);
  const today = localDateKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = localDateKey(yesterdayDate);
  const [customDate, setCustomDate] = useState(date !== today && date !== yesterday);

  const [year, month, day] = draftDate.split('-').map(Number);
  const [hour, minute] = draftTime.split(':').map(Number);
  const rowStyle = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: theme.spacing.sm };
  const itemStyle = { flex: 1, minWidth: theme.controls.minimumTouchTarget * 2 };
  const stepperStyle = {
    flex: 1,
    minWidth: Math.min(theme.controls.minimumTouchTarget * 3 * fontScale, Math.min(width, theme.controls.contentWidth) - theme.spacing.md * 4),
    gap: theme.spacing.sm,
  };
  const setTimePart = (part: 'hour' | 'minute', value: number) => {
    setDraftTime(`${String(part === 'hour' ? value : hour).padStart(2, '0')}:${String(part === 'minute' ? value : minute).padStart(2, '0')}`);
  };
  const applyRelativeTime = (minutesAgo: number) => {
    const value = new Date(Date.now() - minutesAgo * 60_000);
    setDraftDate(localDateKey(value));
    setDraftTime(currentTime(value));
    setForceTimeUpdate(true);
    setCustomDate(false);
  };

  return (
    <Sheet visible={visible} title={t('when')} onClose={onClose} closeLabel={t('close')}>
      <View style={{ gap: theme.spacing.lg }}>
        <View style={rowStyle}>
          <View style={itemStyle}>
            <Choice label={t('today')} selected={draftDate === today} onPress={() => { setDraftDate(today); setCustomDate(false); }} />
          </View>
          <View style={itemStyle}>
            <Choice label={t('yesterday')} selected={draftDate === yesterday} onPress={() => { setDraftDate(yesterday); setCustomDate(false); }} />
          </View>
        </View>
        <Button label={customDate ? draftDate : t('customDate')} variant="secondary" onPress={() => setCustomDate((value) => !value)} />
        {customDate && (
          <Card>
            <View style={{ gap: theme.spacing.md }}>
              <AppText variant="label">{t('year')}</AppText>
              <Stepper value={year} onChange={(value) => setDraftDate(updateDatePart(draftDate, 'year', value))} min={1900} max={9999} decreaseLabel={`${t('decrease')} ${t('year')}`} increaseLabel={`${t('increase')} ${t('year')}`} />
              <View style={rowStyle}>
                <View style={stepperStyle}>
                  <AppText variant="label">{t('month')}</AppText>
                  <Stepper value={month} onChange={(value) => setDraftDate(updateDatePart(draftDate, 'month', value))} min={1} max={12} decreaseLabel={`${t('decrease')} ${t('month')}`} increaseLabel={`${t('increase')} ${t('month')}`} />
                </View>
                <View style={stepperStyle}>
                  <AppText variant="label">{t('day')}</AppText>
                  <Stepper value={day} onChange={(value) => setDraftDate(updateDatePart(draftDate, 'day', value))} min={1} max={daysInMonth(year, month)} decreaseLabel={`${t('decrease')} ${t('day')}`} increaseLabel={`${t('increase')} ${t('day')}`} />
                </View>
              </View>
            </View>
          </Card>
        )}
        <Card>
          <View style={rowStyle}>
            <View style={stepperStyle}>
              <AppText variant="label">{t('hour')}</AppText>
              <Stepper value={hour} onChange={(value) => setTimePart('hour', value)} min={0} max={23} decreaseLabel={`${t('decrease')} ${t('hour')}`} increaseLabel={`${t('increase')} ${t('hour')}`} />
            </View>
            <View style={stepperStyle}>
              <AppText variant="label">{t('minute')}</AppText>
              <Stepper value={minute} onChange={(value) => setTimePart('minute', value)} min={0} max={59} decreaseLabel={`${t('decrease')} ${t('minute')}`} increaseLabel={`${t('increase')} ${t('minute')}`} />
            </View>
          </View>
        </Card>
        <View style={rowStyle}>
          <View style={itemStyle}><Button label={t('now')} variant="secondary" onPress={() => applyRelativeTime(0)} /></View>
          <View style={itemStyle}><Button label={t('fiveAgo')} variant="secondary" onPress={() => applyRelativeTime(5)} /></View>
          <View style={itemStyle}><Button label={t('thirtyAgo')} variant="secondary" onPress={() => applyRelativeTime(30)} /></View>
        </View>
        <Button label={t('done')} onPress={() => onApply(draftDate, draftTime, forceTimeUpdate)} />
      </View>
    </Sheet>
  );
}
