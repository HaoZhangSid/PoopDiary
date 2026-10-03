import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Linking, Pressable, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Activity, AlertTriangle, ArrowRight, Clock3, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Choice, IconButton, Screen, Sheet, Slider, useTheme } from '@/design-system';
import type { DiaryRecord, Severity } from '@/domain/records';
import { currentTime, localDateKey } from '@/domain/records';
import { useAppStore } from '@/state/useAppStore';
import { useFeedbackStore } from '@/state/useFeedbackStore';
import { createDraft, createForm, cycleSeverity, emergencyWarnings, onsetOptions, durationOptions, painLocations, symptomCodes, warningSigns, type SymptomCode, type SymptomForm, type WarningSign, type SymptomStep } from './model';
import { persistDraft } from '@/state/persistDraft';

interface Props { id?: string }
type SheetName = 'time' | 'warning' | undefined;

export function SymptomEditorScreen({ id }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('symptom');
  const { records, status, initialize } = useAppStore();
  const record = id ? records.find((item): item is Extract<DiaryRecord, { kind: 'symptom' }> => item.id === id && item.kind === 'symptom') : undefined;
  const back = () => router.replace(record ? { pathname: '/diary', params: { date: record.localDate } } : id ? '/diary' : '/');
  if (status === 'idle' || status === 'loading') return <Screen title={t(id ? 'editTitle' : 'title')} onBack={back} backLabel={t('back')}><AppText>{t('loading')}</AppText></Screen>;
  if (status === 'error') return <Screen title={t('title')} onBack={back} backLabel={t('back')}><View style={{ gap: theme.spacing.md }}><AppText>{t('loadError')}</AppText><Button label={t('retry')} onPress={() => void initialize().catch(() => undefined)} /></View></Screen>;
  if (id && !record) return <Screen title={t('missing')} onBack={back} backLabel={t('back')}><Button label={t('back')} variant="secondary" onPress={back} /></Screen>;
  return <SymptomEditorForm key={id ?? 'new'} record={record} />;
}

function SymptomChip({ code, level, onPress, label, severity, disabled = false }: { code: SymptomCode; level?: Severity; onPress: () => void; label: string; severity: (value: Severity) => string; disabled?: boolean }) {
  const theme = useTheme();
  const tone = level ? theme.colors.severity[level] : undefined;
  return <Pressable testID={`symptom-${code}`} accessibilityRole="checkbox" accessibilityState={{ checked: Boolean(level), disabled }} accessibilityLabel={`${label}${level ? ` · ${severity(level)}` : ''}`} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ minHeight: theme.controls.choiceTileHeight, flex: 1, padding: theme.spacing.md, borderWidth: theme.controls.borderWidth, borderRadius: theme.radius.md, borderColor: tone?.fg ?? theme.colors.border.control, backgroundColor: pressed ? (tone?.bg ?? theme.colors.surface.subtle) : tone?.bg ?? theme.colors.surface.card, justifyContent: 'space-between', gap: theme.spacing.sm, transform: [{ scale: pressed ? theme.motion.pressedScale : 1 }] })}>
    <AppText variant="label" style={{ color: tone?.fg ?? theme.colors.text.primary }}>{label}</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
      {level ? <AppText variant="caption" style={{ color: tone?.fg }}>{severity(level)}</AppText> : <AppText variant="caption" tone="secondary">+</AppText>}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.xs, marginLeft: 'auto' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {(['mild', 'moderate', 'severe'] as const).map((mark) => <View key={mark} style={{ width: theme.spacing.xs, height: mark === 'mild' ? theme.spacing.xs : mark === 'moderate' ? theme.spacing.sm : theme.spacing.md, borderRadius: theme.radius.sm, backgroundColor: level === mark || (level === 'moderate' && mark === 'mild') || (level === 'severe' && mark !== 'severe') ? tone?.fg ?? theme.colors.text.primary : theme.colors.border.default }} />)}
      </View>
    </View>
  </Pressable>;
}

function SymptomSafetyStop({ warning, onBack }: { warning: WarningSign; onBack: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation('symptom');
  const [callFailed, setCallFailed] = useState(false);
  const emergency = emergencyWarnings.includes(warning);
  useEffect(() => { const listener = BackHandler.addEventListener('hardwareBackPress', () => { onBack(); return true; }); return () => listener.remove(); }, [onBack]);
  const call = async () => { setCallFailed(false); try { await Linking.openURL('tel:112'); } catch { setCallFailed(true); } };
  return <Screen title={t('warning.title')} onBack={onBack} backLabel={t('back')}><View style={{ gap: theme.spacing.lg }} accessibilityLiveRegion="assertive"><Card><View style={{ gap: theme.spacing.md }}><AppText variant="sectionTitle">{t(`warning.signs.${warning}`)}</AppText><AppText variant="label">{t(emergency ? 'warning.urgent' : 'warning.soon')}</AppText><AppText>{t(emergency ? 'warning.urgentCopy' : 'warning.soonCopy')}</AppText></View></Card>{emergency && <Button label={t('warning.call')} variant="danger" onPress={() => void call()} />}{callFailed && <AppText tone="danger">{t('warning.callError')}</AppText>}<AppText tone="secondary">{t('warning.note')}</AppText><Button label={t('warning.modify')} variant="secondary" onPress={onBack} /></View></Screen>;
}

function SymptomEditorForm({ record }: { record?: Extract<DiaryRecord, { kind: 'symptom' }> }) {
  const theme = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation('symptom');
  const { createRecord, updateRecord } = useAppStore();
  const { width, fontScale } = useWindowDimensions();
  const [form, setForm] = useState<SymptomForm>(() => createForm(record));
  const [step, setStep] = useState<SymptomStep>('select');
  const [sheet, setSheet] = useState<SheetName>();
  const [warning, setWarning] = useState<WarningSign>();
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [forceTimeUpdate, setForceTimeUpdate] = useState(false);
  const mounted = useRef(true);
  const saveInProgress = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [gridWidth, setGridWidth] = useState(Math.min(width, theme.controls.contentWidth) - theme.spacing.md * 2);
  const columns = gridWidth / fontScale >= theme.controls.minimumTouchTarget * 6 ? 2 : 1;
  const cell = { width: (gridWidth - theme.spacing.sm * (columns - 1)) / columns };
  const active = Object.keys(form.levels) as SymptomCode[];
  const patch = (next: Partial<SymptomForm>) => { if (!saveInProgress.current) { setForm((value) => ({ ...value, ...next })); setSaveFailed(false); } };
  const back = useCallback(() => { if (saveInProgress.current) return; if (step === 'select') router.replace(record ? { pathname: '/diary', params: { date: record.localDate } } : record ? '/diary' : '/'); else setStep(step === 'save' ? 'details' : 'select'); }, [record, router, step]);
  useEffect(() => { if (step === 'select' || warning) return; const listener = BackHandler.addEventListener('hardwareBackPress', () => { back(); return true; }); return () => listener.remove(); }, [back, step, warning]);
  const save = async () => {
    if (saveInProgress.current || !active.length || warning) return;
    saveInProgress.current = true; setSaving(true); setSaveFailed(false);
    try {
      const draft = createDraft(form, Intl.DateTimeFormat().resolvedOptions().timeZone, record, forceTimeUpdate);
      await persistDraft(draft, record?.id, { createRecord, updateRecord }, { isActive: () => mounted.current, onFailed: () => { setSaveFailed(true); saveInProgress.current = false; setSaving(false); }, onSaved: (saved) => { useFeedbackStore.getState().show(t(record ? 'updated' : 'saved')); router.replace(record ? { pathname: '/diary', params: { date: saved.localDate } } : '/'); } });
    } catch { setSaveFailed(true); saveInProgress.current = false; setSaving(false); }
  };
  const levelLabel = (value: Severity) => t(`severities.${value}`);
  const timeLabel = `${new Intl.DateTimeFormat(i18n.resolvedLanguage, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${form.date}T12:00:00`))} · ${form.time}`;
  if (warning) return <SymptomSafetyStop warning={warning} onBack={() => setWarning(undefined)} />;
  const title = step === 'select' ? t('title') : step === 'details' ? t('detailsLabel') : t('saveLabel');
  return <Screen key={step} title={title} subtitle={`${t('selectLabel')} · ${record ? t('editTitle') : t('title')}`} onBack={back} backLabel={t('back')} right={<IconButton icon={X} label={t('close')} onPress={back} disabled={saving} />} footer={<View style={{ gap: theme.spacing.xs }}>{saveFailed && <AppText tone="danger" accessibilityRole="alert">{t('saveError')}</AppText>}<Button label={record ? t('saveChanges') : t('saveEntry')} icon={ArrowRight} onPress={() => void save()} loading={saving} disabled={saving || !active.length} testID="symptom-save" /></View>}>
    <View style={{ gap: theme.spacing.lg }} onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}>
      <View style={{ gap: theme.spacing.sm }}><View style={{ height: theme.spacing.xs, borderRadius: theme.radius.pill, backgroundColor: theme.colors.border.default, overflow: 'hidden' }}><View style={{ width: `${step === 'select' ? 33 : step === 'details' ? 66 : 100}%`, height: '100%', backgroundColor: theme.colors.text.primary }} /></View><AppText variant="caption" tone="secondary">{step === 'select' ? '1' : step === 'details' ? '2' : '3'} / 3</AppText></View>
      {step === 'select' && <>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{symptomCodes.map((code) => <View key={code} style={cell}><SymptomChip code={code} label={t(`symptoms.${code}`)} level={form.levels[code]} severity={levelLabel} onPress={() => patch(cycleSeverity(form, code))} disabled={saving} /></View>)}</View>
        <Button label={t('warning.button')} variant="secondary" icon={AlertTriangle} onPress={() => setSheet('warning')} disabled={saving} testID="symptom-safety" />
        {!record && <Button label={t('noSymptoms')} variant="text" onPress={() => router.replace('/')} disabled={saving} />}
        <Button label={t('addDetails')} variant="text" icon={ArrowRight} onPress={() => setStep('details')} disabled={saving || !active.length} testID="symptom-details" />
      </>}
      {step === 'details' && <View style={{ gap: theme.spacing.lg }}>
        {form.levels.pain && <><Slider label={`${t('painLevel')} · ${form.painLevel}`} value={form.painLevel} onValueChange={(value) => patch({ painLevel: Math.round(value) as SymptomForm['painLevel'] })} minimumValue={0} maximumValue={10} step={1} tone="symptom" testID="symptom-pain-slider" /><AppText variant="label">{t('painLocation')}</AppText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{painLocations.map((location) => <View key={location} style={cell}><Choice label={t(`locations.${location}`)} density="compact" selected={form.painLocation === location} onPress={() => patch({ painLocation: location })} style={{ flex: 1 }} /></View>)}</View></>}
        {form.levels.nausea && <View style={{ gap: theme.spacing.sm }}><AppText variant="label">{t('vomiting')}</AppText><View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>{[true, false].map((value) => <View key={String(value)} style={{ flex: 1 }}><Choice label={t(value ? 'yes' : 'no')} selected={form.vomiting === value} onPress={() => patch({ vomiting: value })} style={{ flex: 1 }} /></View>)}</View></View>}
        <View style={{ gap: theme.spacing.sm }}><AppText variant="label">{t('onset')}</AppText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{onsetOptions.map((value) => <View key={value} style={cell}><Choice label={t(`onsetOptions.${value}`)} density="compact" selected={form.onset === value} onPress={() => patch({ onset: value })} style={{ flex: 1 }} /></View>)}</View></View>
        <View style={{ gap: theme.spacing.sm }}><AppText variant="label">{t('duration')}</AppText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{durationOptions.map((value) => <View key={value} style={cell}><Choice label={t(`durationOptions.${value}`)} density="compact" selected={form.duration === value} onPress={() => patch({ duration: value })} style={{ flex: 1 }} /></View>)}</View></View>
        <Button label={t('continue')} icon={ArrowRight} onPress={() => setStep('save')} disabled={saving} testID="symptom-continue" />
      </View>}
      {step === 'save' && <View style={{ gap: theme.spacing.lg }}><Card style={{ backgroundColor: theme.colors.entry.symptom.bg }}><View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' }}><Activity size={theme.controls.icon} color={theme.colors.entry.symptom.fg} /><View style={{ flex: 1, gap: theme.spacing.xs }}><AppText variant="label" style={{ color: theme.colors.entry.symptom.fg }}>{active.map((code) => t(`symptoms.${code}`)).join(' · ')}</AppText><AppText variant="caption" style={{ color: theme.colors.entry.symptom.fg }}>{active.map((code) => levelLabel(form.levels[code]!)).join(' · ')}</AppText></View></View></Card><Button label={timeLabel} variant="secondary" icon={Clock3} onPress={() => setSheet('time')} disabled={saving} /></View>}
    </View>
    <Sheet visible={sheet === 'warning'} title={t('warning.button')} onClose={() => setSheet(undefined)} closeLabel={t('close')}><View style={{ gap: theme.spacing.sm }}>{warningSigns.map((sign) => <Choice key={sign} label={t(`warning.signs.${sign}`)} onPress={() => { setSheet(undefined); setWarning(sign); }} />)}</View></Sheet>
    <Sheet visible={sheet === 'time'} title={t('when')} onClose={() => setSheet(undefined)} closeLabel={t('close')}><View style={{ gap: theme.spacing.sm }}><Button label={t('now')} variant="secondary" onPress={() => { const value = new Date(); patch({ date: localDateKey(value), time: currentTime(value) }); setForceTimeUpdate(true); setSheet(undefined); }} /><Button label={t('fiveAgo')} variant="secondary" onPress={() => { const value = new Date(Date.now() - 5 * 60_000); patch({ date: localDateKey(value), time: currentTime(value) }); setForceTimeUpdate(true); setSheet(undefined); }} /><Button label={t('thirtyAgo')} variant="secondary" onPress={() => { const value = new Date(Date.now() - 30 * 60_000); patch({ date: localDateKey(value), time: currentTime(value) }); setForceTimeUpdate(true); setSheet(undefined); }} /></View></Sheet>
  </Screen>;
}
