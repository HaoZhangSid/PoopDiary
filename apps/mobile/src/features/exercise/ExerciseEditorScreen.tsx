import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bike, Check, Dumbbell, Footprints, HeartPulse, Mountain, Waves, X, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Choice, IconButton, Screen, Stepper, useTheme } from '@/design-system';
import type { DiaryRecord, ExerciseDetails, RecordDraft } from '@/domain/records';
import { currentTime, localDateKey, localEventTimestamp } from '@/domain/records';
import { useAppStore } from '@/state/useAppStore';
import { useFeedbackStore } from '@/state/useFeedbackStore';
import { persistDraft } from '@/state/persistDraft';

interface Props { id?: string; quick?: boolean }
type ExerciseRecord = Extract<DiaryRecord, { kind: 'exercise' }>;
type Activity = ExerciseDetails['activity'];
const options: { value: Activity; key: 'walking' | 'running' | 'cycling' | 'strength' | 'yoga' | 'swimming' | 'ball' | 'other'; icon: LucideIcon }[] = [
  { value: 'walking', key: 'walking', icon: Footprints }, { value: 'running', key: 'running', icon: Mountain },
  { value: 'cycling', key: 'cycling', icon: Bike }, { value: 'strength', key: 'strength', icon: Dumbbell },
  { value: 'yoga', key: 'yoga', icon: HeartPulse }, { value: 'swimming', key: 'swimming', icon: Waves },
  { value: 'ball', key: 'ball', icon: HeartPulse }, { value: 'other', key: 'other', icon: Check },
];

function draftFor(form: ExerciseDetails, record?: ExerciseRecord): RecordDraft {
  const date = record?.localDate ?? localDateKey(new Date());
  const time = record ? new Intl.DateTimeFormat('en-GB', { timeZone: record.timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(record.occurredAt)) : currentTime();
  return { kind: 'exercise', occurredAt: record?.occurredAt ?? localEventTimestamp(date, time), localDate: date, timeZone: record?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone, details: form };
}

export function ExerciseEditorScreen({ id, quick = false }: Props) {
  const theme = useTheme(); const router = useRouter(); const { t } = useTranslation('exercise');
  const { records, status, initialize } = useAppStore();
  const record = id ? records.find((item): item is ExerciseRecord => item.id === id && item.kind === 'exercise') : undefined;
  const back = () => router.replace(record ? { pathname: '/diary', params: { date: record.localDate } } : id ? '/diary' : '/');
  if (status === 'idle' || status === 'loading') return <Screen title={t('title')} onBack={back} backLabel={t('back')}><ActivityIndicator color={theme.colors.text.primary} /></Screen>;
  if (status === 'error') return <Screen title={t('title')} onBack={back} backLabel={t('back')}><Button label={t('retry')} onPress={() => void initialize().catch(() => undefined)} /></Screen>;
  if (id && !record) return <Screen title={t('missing')} onBack={back} backLabel={t('back')}><Button label={t('back')} variant="secondary" onPress={back} /></Screen>;
  return <ExerciseEditorForm key={id ?? 'new'} record={record} quick={quick} />;
}

function ExerciseEditorForm({ record, quick }: { record?: ExerciseRecord; quick?: boolean }) {
  const theme = useTheme(); const router = useRouter(); const { t } = useTranslation('exercise');
  const { createRecord, updateRecord } = useAppStore();
  // The Web flow starts with no activity selected; details appear after the
  // user chooses one. Existing records still open on their saved activity.
  const [activity, setActivity] = useState<Activity | undefined>(record?.details.activity);
  const [duration, setDuration] = useState(record?.details.durationMinutes ?? 30);
  const [distance, setDistance] = useState(record?.details.distanceKm ?? (activity === 'running' ? 4.2 : 2));
  const [steps, setSteps] = useState(record?.details.steps ?? 3000);
  const [intensity, setIntensity] = useState<ExerciseDetails['intensity']>(record?.details.intensity ?? 'moderate');
  const [trainingType, setTrainingType] = useState<NonNullable<ExerciseDetails['trainingType']>>(record?.details.trainingType ?? 'strength');
  const [saving, setSaving] = useState(false); const mounted = useRef(true); const saveInProgress = useRef(false);
  useEffect(() => () => { mounted.current = false; }, []);
  const exit = () => { if (!saveInProgress.current) router.replace(record ? { pathname: '/diary', params: { date: record.localDate } } : '/'); };
  const save = async () => {
    if (saveInProgress.current) return; saveInProgress.current = true; setSaving(true);
    if (!activity) { saveInProgress.current = false; setSaving(false); return; }
    const details: ExerciseDetails = { activity, durationMinutes: duration, intensity, ...(activity === 'walking' ? { steps, distanceKm: distance } : {}), ...(activity === 'running' || activity === 'cycling' ? { distanceKm: distance } : {}), ...(activity === 'strength' ? { trainingType } : {}) };
    await persistDraft(draftFor(details, record), record?.id, { createRecord, updateRecord }, { isActive: () => mounted.current, onFailed: () => { saveInProgress.current = false; setSaving(false); }, onSaved: () => { useFeedbackStore.getState().show(t(record ? 'updated' : 'saved')); router.replace(record ? '/diary' : '/'); } });
  };
  const current = options.find((option) => option.value === activity);
  return <Screen title={record ? t('editTitle') : t('prompt')} subtitle={undefined} onBack={exit} backLabel={t('back')} maxWidth={600} flowBrand flowEyebrow={`${t('title')} · ${record ? t('editTitle') : t('quickLog')}`} flowStep={activity ? 2 : 1} flowTotal={2} right={<IconButton icon={X} label={t('close')} onPress={exit} disabled={saving} />} footer={activity ? <Button label={record ? t('saveChanges') : t('save')} onPress={() => void save()} loading={saving} disabled={saving} /> : undefined}>
    <View style={{ gap: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{options.map(({ value, key, icon: Icon }) => <View key={value} style={{ width: '47%', flexGrow: 1 }}><Choice label={t(key)} icon={Icon} selected={activity === value} onPress={() => setActivity(value)} style={{ minHeight: 66 }} /></View>)}</View>
      {activity && current && <View style={{ gap: theme.spacing.md }}><AppText variant="sectionTitle">{t(current.key)}</AppText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}><View style={{ flexGrow: 1, minWidth: 150 }}><AppText variant="label">{t('duration')}</AppText><Stepper value={duration} min={1} max={600} step={5} suffix={t('minutes')} onChange={setDuration} /></View>{(activity === 'walking' || activity === 'running' || activity === 'cycling') && <View style={{ flexGrow: 1, minWidth: 150 }}><AppText variant="label">{t('distance')}</AppText><Stepper value={distance} min={0} max={100} step={0.1} suffix={t('km')} onChange={setDistance} /></View>}{activity === 'walking' && <View style={{ flexGrow: 1, minWidth: 150 }}><AppText variant="label">{t('steps')}</AppText><Stepper value={steps} min={0} max={100000} step={500} suffix={t('stepsUnit')} onChange={setSteps} /></View>}</View>
      <AppText variant="label">{t('intensity')}</AppText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{(['light', 'moderate', 'vigorous'] as const).map((value) => <View key={value} style={{ flex: 1, minWidth: 100 }}><Choice label={value === 'light' ? t('easy') : value === 'moderate' ? t('moderate') : t('veryHard')} selected={intensity === value} onPress={() => setIntensity(value)} /></View>)}</View>
      {activity === 'strength' && <><AppText variant="label">{t('trainingType')}</AppText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{(['cardio', 'strength', 'flexibility', 'other'] as const).map((value) => <View key={value} style={{ flex: 1, minWidth: 110 }}><Choice label={value === 'strength' ? t('strength') : value === 'cardio' ? t('cardio') : value === 'flexibility' ? t('flexibility') : t('other')} selected={trainingType === value} onPress={() => setTrainingType(value)} /></View>)}</View></>}
      </View>}
    </View>
  </Screen>;
}
