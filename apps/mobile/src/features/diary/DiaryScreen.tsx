import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, IconButton, Screen, Sheet, useTheme } from '@/design-system';
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
  const { t, i18n } = useTranslation(['diary', 'common', 'bowel']);
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
  return <Screen title={t('title')} right={<IconButton label={t('add')} icon={Plus} onPress={() => router.push('/bowel')} />}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
      <IconButton label={t('previousDay', { ns: 'common' })} icon={ChevronLeft} onPress={() => changeDate(shiftDate(visibleDate, -1))} />
      <View style={{ flex: 1 }}><AppText variant="label" style={{ textAlign: 'center' }}>{displayDate(visibleDate, i18n.language, true)}</AppText></View>
      <IconButton label={t('nextDay', { ns: 'common' })} icon={ChevronRight} onPress={() => changeDate(shiftDate(visibleDate, 1))} />
    </View>
    {visibleDate !== localDateKey(new Date()) && <Button variant="secondary" label={t('today', { ns: 'common' })} onPress={() => changeDate(localDateKey(new Date()))} />}
    {!visibleRecords.length && <AppText tone="secondary">{t('empty')}</AppText>}
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
        {Boolean(selectedRecord.details.note) && <AppText>{selectedRecord.details.note}</AppText>}
        {Boolean(error) && <AppText tone="danger">{error}</AppText>}
        {confirmDelete ? <>
          <Button variant="danger" label={t('delete', { ns: 'common' })} loading={busy} onPress={() => { void remove(); }} />
          <Button variant="secondary" label={t('cancel', { ns: 'common' })} disabled={busy} onPress={() => setConfirmDelete(false)} />
        </> : <>
          {selectedRecord.kind === 'bowel' && <Button label={t('edit', { ns: 'common' })} onPress={() => { const id = selectedRecord.id; close(); router.push({ pathname: '/bowel/[id]', params: { id } }); }} />}
          <Button variant="danger" label={t('delete', { ns: 'common' })} onPress={() => setConfirmDelete(true)} />
        </>}
      </>}
    </Sheet>
  </Screen>;
}
