import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Battery, Moon, Sparkles, X, Zap } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Choice, IconButton, Screen, Slider, useTheme } from '@/design-system';
import type { DiaryRecord, RecordDraft, SleepDetails } from '@/domain/records';
import { localDateKey } from '@/domain/records';
import { useAppStore } from '@/state/useAppStore';
import { useFeedbackStore } from '@/state/useFeedbackStore';
import { persistDraft } from '@/state/persistDraft';

interface Props { id?: string; quick?: boolean }
type SleepRecord = Extract<DiaryRecord, { kind: 'sleep' }>;
type Quality = SleepDetails['quality']; type Energy = NonNullable<SleepDetails['energy']>;

function readLocal(record: SleepRecord): { startedAt: string; endedAt: string } { return { startedAt: record.details.startedAt, endedAt: record.details.endedAt }; }
function initialMinutes(record?: SleepRecord): number { if (!record) return 450; return Math.max(240, Math.min(720, Math.round((Date.parse(record.details.endedAt) - Date.parse(record.details.startedAt)) / 60_000))); }

export function SleepEditorScreen({ id, quick = false }: Props) {
  const theme = useTheme(); const router = useRouter(); const { t } = useTranslation('sleep');
  const { records, status, initialize } = useAppStore();
  const record = id ? records.find((item): item is SleepRecord => item.id === id && item.kind === 'sleep') : undefined;
  const back = () => router.replace(record ? { pathname: '/diary', params: { date: record.localDate } } : id ? '/diary' : '/');
  if (status === 'idle' || status === 'loading') return <Screen title={t('title')} onBack={back} backLabel={t('back')}><ActivityIndicator color={theme.colors.text.primary} /></Screen>;
  if (status === 'error') return <Screen title={t('title')} onBack={back} backLabel={t('back')}><Button label={t('retry')} onPress={() => void initialize().catch(() => undefined)} /></Screen>;
  if (id && !record) return <Screen title={t('missing')} onBack={back} backLabel={t('back')}><Button label={t('back')} variant="secondary" onPress={back} /></Screen>;
  return <SleepEditorForm key={id ?? 'new'} record={record} quick={quick} />;
}

function SleepEditorForm({ record, quick }: { record?: SleepRecord; quick?: boolean }) {
  const theme = useTheme(); const router = useRouter(); const { t } = useTranslation('sleep');
  const { createRecord, updateRecord } = useAppStore(); const [minutes, setMinutes] = useState(() => initialMinutes(record));
  const [quality, setQuality] = useState<Quality>(record?.details.quality ?? 'good'); const [awakenings, setAwakenings] = useState<0 | 1 | 2 | 3>(record?.details.awakenings ?? 0); const [energy, setEnergy] = useState<Energy>(record?.details.energy ?? 'refreshed');
  const [detailsOpen, setDetailsOpen] = useState(Boolean(record)); const [saving, setSaving] = useState(false); const mounted = useRef(true); const saveInProgress = useRef(false);
  useEffect(() => () => { mounted.current = false; }, []);
  const exit = () => { if (!saveInProgress.current) router.replace(record ? { pathname: '/diary', params: { date: record.localDate } } : '/'); };
  const duration = `${Math.floor(minutes / 60)}${t('hourUnit')}${minutes % 60 ? ` ${minutes % 60}${t('minuteUnit')}` : ''}`.trim();
  const save = async () => {
    if (saveInProgress.current) return; saveInProgress.current = true; setSaving(true);
    // Preserve wake-up time on edit and derive bedtime from the slider.
    const end = record ? new Date(readLocal(record).endedAt) : new Date(); const start = new Date(end.getTime() - minutes * 60_000); const details: SleepDetails = { startedAt: start.toISOString(), endedAt: end.toISOString(), quality, awakenings, energy };
    const date = record?.localDate ?? localDateKey(end); const draft: RecordDraft = { kind: 'sleep', occurredAt: details.endedAt, localDate: date, timeZone: record?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone, details };
    await persistDraft(draft, record?.id, { createRecord, updateRecord }, { isActive: () => mounted.current, onFailed: () => { saveInProgress.current = false; setSaving(false); }, onSaved: () => { useFeedbackStore.getState().show(t(record ? 'updated' : 'saved')); router.replace(record ? '/diary' : '/'); } });
  };
  return <Screen title={record ? t('editTitle') : t('prompt')} subtitle={record ? undefined : undefined} onBack={exit} backLabel={t('back')} maxWidth={600} flowBrand flowEyebrow={`${t('title')} · ${t('quickRecord')}`} flowStep={quick ? undefined : 1} flowTotal={quick ? undefined : 1} right={<IconButton icon={X} label={t('close')} onPress={exit} disabled={saving} />} footer={<Button label={record ? t('saveChanges') : t('save')} onPress={() => void save()} loading={saving} disabled={saving} />}>
    <View style={{ gap: theme.spacing.lg }}>
      <Card style={{ alignItems: 'center', gap: theme.spacing.sm, backgroundColor: theme.colors.entry.sleep.bg }}><Moon size={theme.controls.icon} color={theme.colors.entry.sleep.fg} /><AppText variant="heroTitle" style={{ color: theme.colors.entry.sleep.fg }}>{duration}</AppText><AppText tone="secondary">{t('duration')}</AppText></Card>
      <Slider label={t('duration')} value={minutes} onValueChange={(value) => setMinutes(Math.round(value / 15) * 15)} minimumValue={240} maximumValue={720} step={15} testID="sleep-duration-slider" />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>{[4, 6, 8, 10, 12].map((value) => <AppText key={value} variant="caption" tone="secondary">{value} {t('hourUnit')}</AppText>)}</View>
      <Button label={detailsOpen ? t('hideDetails') : (quick ? t('optionalFeelings') : t('addDetails'))} variant="secondary" icon={Sparkles} onPress={() => setDetailsOpen((value) => !value)} />
      {detailsOpen && <View style={{ gap: theme.spacing.lg }}><AppText variant="label">{t('quality')}</AppText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{(['poor', 'fair', 'good', 'great'] as const).map((value) => <View key={value} style={{ flex: 1, minWidth: 110 }}><Choice label={t(value)} selected={quality === value} onPress={() => setQuality(value)} /></View>)}</View><AppText variant="label">{t('awakenings')}</AppText><View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>{([0, 1, 2, 3] as const).map((value) => <View key={value} style={{ flex: 1 }}><Choice label={value === 3 ? '3+' : String(value)} selected={awakenings === value} onPress={() => setAwakenings(value)} /></View>)}</View><AppText variant="label">{t('morningFeeling')}</AppText><View style={{ gap: theme.spacing.sm }}>{([['exhausted', 'veryTired'], ['normal', 'okay'], ['refreshed', 'refreshed'], ['energized', 'fullEnergy']] as const).map(([value, label]) => <Choice key={value} label={t(label)} icon={value === 'energized' ? Zap : Battery} selected={energy === value} onPress={() => setEnergy(value)} />)}</View></View>}
    </View>
  </Screen>;
}
