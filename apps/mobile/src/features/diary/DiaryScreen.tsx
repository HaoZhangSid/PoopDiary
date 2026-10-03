import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BookOpen, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Screen, Sheet, useTheme } from '@/design-system';
import { isLocalDate, localDateKey, type DiaryRecord } from '@/domain/records';
import { useAppStore } from '@/state/useAppStore';
import { useFeedbackStore } from '@/state/useFeedbackStore';
import { displayDate, displayTime, recordTitle, recordSummary } from '@/i18n/recordPresentation';
import { RecordCard } from './RecordCard';

function shiftDate(key: string, days: number) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function DiaryScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation(['diary', 'common', 'bowel', 'symptom']);
  const records = useAppStore((state) => state.records);
  const deleteRecord = useAppStore((state) => state.deleteRecord);
  const restoreRecord = useAppStore((state) => state.restoreRecord);
  const { entry, date: requestedDate } = useLocalSearchParams<{ entry?: string; date?: string }>();
  const [date, setDate] = useState(localDateKey(new Date()));
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const requested = records.find((record) => record.id === entry);
  const selectedRecord = records.find((record) => record.id === (selected ?? entry));
  const validRequestedDate = isLocalDate(requestedDate) ? requestedDate : undefined;
  const visibleDate = entry && requested ? requested.localDate : validRequestedDate ?? date;
  const changeDate = (next: string) => { setDate(next); if (entry || requestedDate) router.replace('/diary'); };
  const visibleRecords = records.filter((record) => record.localDate === visibleDate).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const dateWindow = [-2, -1, 0, 1, 2].map((offset) => shiftDate(visibleDate, offset));
  const close = () => { if (busy) return; setDate(visibleDate); setSelected(null); setConfirmDelete(false); setError(''); if (entry) router.replace('/diary'); };
  const open = (record: DiaryRecord) => { setError(''); setConfirmDelete(false); setSelected(record.id); };
  const remove = async () => {
    if (!selectedRecord || busy) return;
    setBusy(true);
    try {
      const snapshot = selectedRecord;
      await deleteRecord(snapshot.id);
      setDate(snapshot.localDate);
      setSelected(null); setConfirmDelete(false); if (entry) router.replace('/diary');
      useFeedbackStore.getState().show(t('deleted', { ns: 'common' }), { label: t('undo', { ns: 'common' }), onPress: async () => {
        try { await restoreRecord(snapshot); useFeedbackStore.getState().show(t('restored', { ns: 'common' })); }
        catch { useFeedbackStore.getState().show(t('restoreError'), undefined, 'danger'); }
      } });
    } catch { setError(t('deleteError')); }
    finally { setBusy(false); }
  };
  return <Screen>
    <View style={{ marginTop: theme.spacing.lg - theme.spacing.xs - theme.controls.borderWidth, marginBottom: theme.spacing.md + theme.spacing.sm + theme.controls.borderWidth * 2, gap: theme.spacing.sm }}>
      <AppText variant="eyebrow" tone="secondary">{t('eyebrow')}</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: theme.spacing.md }}>
        <AppText variant="webPageTitle" accessibilityRole="header">{t('title')}</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel={t('log', { ns: 'common' })} onPress={() => router.push('/bowel')} style={({ pressed }) => ({ width: 74, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xs, borderRadius: theme.radius.md, backgroundColor: pressed ? theme.colors.action.primary.pressed : theme.colors.action.primary.background })}><Plus size={17} color={theme.colors.action.primary.foreground} /><AppText variant="label" style={{ color: theme.colors.action.primary.foreground, fontSize: 13, lineHeight: 18 }}>{t('log', { ns: 'common' }).toLowerCase()}</AppText></Pressable>
      </View>
    </View>
    <View style={{ height: 83, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: theme.spacing.md, borderTopWidth: theme.controls.borderWidth, borderBottomWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default }}>
      <DateArrow label={t('previousDay', { ns: 'common' })} icon={ChevronLeft} onPress={() => changeDate(shiftDate(visibleDate, -1))} />
      <View style={{ width: '100%', maxWidth: 480, flexGrow: 0, flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.xs, marginHorizontal: theme.spacing.md }}>
        {dateWindow.map((key) => {
          const selectedDay = key === visibleDate;
          const today = key === localDateKey(new Date());
          const dateObject = new Date(`${key}T12:00:00`);
          const day = new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(dateObject);
          return <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: selectedDay }} onPress={() => changeDate(key)} style={{ position: 'relative', width: 92, minHeight: 57, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xs / 2, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.md, backgroundColor: selectedDay ? theme.colors.surface.subtle : 'transparent' }}>
            <AppText variant="label" style={{ fontSize: 16, lineHeight: 20, color: selectedDay ? theme.colors.text.primary : theme.colors.text.secondary }}>{dateObject.getDate()}</AppText>
            <AppText variant="caption" tone="secondary" style={{ fontSize: 10, lineHeight: 12 }}>{day}</AppText>
            {today && <View style={{ position: 'absolute', bottom: theme.spacing.xs, width: theme.spacing.xs, height: theme.spacing.xs, borderRadius: theme.radius.pill, backgroundColor: theme.colors.entry.bowel.fg }} />}
          </Pressable>;
        })}
      </View>
      <DateArrow label={t('nextDay', { ns: 'common' })} icon={ChevronRight} onPress={() => changeDate(shiftDate(visibleDate, 1))} />
    </View>
    <View style={{ marginTop: theme.spacing.lg + theme.spacing.xs - theme.controls.borderWidth, marginBottom: -theme.controls.borderWidth, gap: theme.spacing.sm }}>
      <AppText variant="eyebrow" tone="secondary">{visibleDate === localDateKey(new Date()) ? t('today', { ns: 'common' }) : displayDate(visibleDate, i18n.language, true)}</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: theme.spacing.md }}>
        <AppText variant="dateTitle" accessibilityRole="header">{displayDate(visibleDate, i18n.language, true)}</AppText>
        <AppText variant="caption" tone="secondary">{t('entryCount', { ns: 'home', count: visibleRecords.length })}</AppText>
      </View>
    </View>
    {!visibleRecords.length && <Card style={{ minHeight: 280, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderRadius: theme.radius.md + theme.spacing.xs, gap: theme.spacing.sm }}>
      <BookOpen size={theme.controls.icon + theme.spacing.sm} color={theme.colors.text.secondary} />
      <AppText variant="label">{t('empty')}</AppText>
    </Card>}
    {visibleRecords.map((record) => <RecordCard key={record.id} record={record} onPress={() => open(record)} />)}
    <Sheet visible={Boolean(selectedRecord)} title={confirmDelete ? t('deleteTitle') : t('details')} onClose={close} closeLabel={t('close', { ns: 'common' })}>
      {selectedRecord && <>
        <AppText variant="sectionTitle">{recordTitle(selectedRecord)}</AppText>
        <AppText tone="secondary">{displayDate(selectedRecord.localDate, i18n.language)} · {displayTime(selectedRecord, i18n.language)}</AppText>
        <AppText>{recordSummary(selectedRecord)}</AppText>
        {selectedRecord.kind === 'bowel' && <>
          {selectedRecord.details.painLevel !== undefined && <AppText>{t('painLevel', { ns: 'bowel' })} · {selectedRecord.details.painLevel}/10</AppText>}
          {selectedRecord.details.painLocation && <AppText>{t(`locations.${selectedRecord.details.painLocation}`, { ns: 'bowel' })}</AppText>}
          {selectedRecord.details.bloating && <AppText>{t('bloating', { ns: 'bowel' })} · {t(`severities.${selectedRecord.details.bloating}`, { ns: 'bowel' })}</AppText>}
          {selectedRecord.details.urgency && <AppText>{t(`urgencies.${selectedRecord.details.urgency}`, { ns: 'bowel' })}</AppText>}
        </>}
        {selectedRecord.kind === 'symptom' && <>
          {selectedRecord.details.symptoms.map((entry) => <AppText key={entry.code}>{t(`symptoms.${entry.code}`, { ns: 'symptom' })} · {t(`severities.${entry.severity}`, { ns: 'symptom' })}</AppText>)}
          {selectedRecord.details.durationMinutes !== undefined && <AppText>{t('duration', { ns: 'symptom' })} · {selectedRecord.details.durationMinutes} {t('minutes', { ns: 'common' })}</AppText>}
        </>}
        {Boolean(selectedRecord.details.note) && <AppText>{selectedRecord.details.note}</AppText>}
        {Boolean(error) && <AppText tone="danger">{error}</AppText>}
        {confirmDelete ? <>
          <Button variant="danger" label={t('delete', { ns: 'common' })} loading={busy} onPress={() => { void remove(); }} />
          <Button variant="secondary" label={t('cancel', { ns: 'common' })} disabled={busy} onPress={() => setConfirmDelete(false)} />
        </> : <>
          {selectedRecord.kind === 'bowel' && <Button label={t('edit', { ns: 'common' })} onPress={() => { const id = selectedRecord.id; close(); router.push({ pathname: '/bowel/[id]', params: { id } }); }} />}
          {selectedRecord.kind === 'water' && <Button label={t('edit', { ns: 'common' })} onPress={() => { const id = selectedRecord.id; close(); router.push({ pathname: '/water/[id]', params: { id } }); }} />}
          {selectedRecord.kind === 'symptom' && <Button label={t('edit', { ns: 'common' })} onPress={() => { const id = selectedRecord.id; close(); router.push({ pathname: '/symptom/[id]', params: { id } }); }} />}
          {selectedRecord.kind === 'food' && <Button label={t('edit', { ns: 'common' })} onPress={() => { const id = selectedRecord.id; close(); router.push({ pathname: '/food/[id]', params: { id } }); }} />}
          {selectedRecord.kind === 'exercise' && <Button label={t('edit', { ns: 'common' })} onPress={() => { const id = selectedRecord.id; close(); router.push({ pathname: '/exercise/[id]', params: { id } }); }} />}
          {selectedRecord.kind === 'sleep' && <Button label={t('edit', { ns: 'common' })} onPress={() => { const id = selectedRecord.id; close(); router.push({ pathname: '/sleep/[id]', params: { id } }); }} />}
          <Button variant="danger" label={t('delete', { ns: 'common' })} onPress={() => setConfirmDelete(true)} />
        </>}
      </>}
    </Sheet>
  </Screen>;
}

function DateArrow({ label, icon: Icon, onPress }: { label: string; icon: typeof ChevronLeft; onPress: () => void }) {
  const theme = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, borderRadius: theme.radius.sm, backgroundColor: pressed ? theme.colors.surface.subtle : theme.colors.surface.card })}><Icon size={18} color={theme.colors.text.secondary} /></Pressable>;
}
