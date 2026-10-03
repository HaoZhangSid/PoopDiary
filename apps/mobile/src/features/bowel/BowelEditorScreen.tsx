import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, TextInput, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowRight, CircleHelp, Clock3, X } from 'lucide-react-native';
import { AppText, Button, Card, Choice, IconButton, Screen, Sheet, Slider, useTheme } from '@/design-system';
import type { BowelRecord, RecordDraft } from '@/domain/records';
import { useAppStore } from '@/state/useAppStore';
import { useFeedbackStore } from '@/state/useFeedbackStore';
import { DateTimeSheet } from './components/DateTimeSheet';
import { SafetyStopScreen } from './components/SafetyStopScreen';
import { StoolShape } from './components/StoolShape';
import { persistDraft } from './persistDraft';
import {
  adjacentStep, createDraft, createForm, feelings, painLocations, sensations, severityLevels,
  stoolTypes, toggleSensation, urgencyLevels, warningSigns,
  type BowelForm, type BowelStep, type WarningSign,
} from './model';

interface Props { id?: string }
type SheetName = 'examples' | 'time' | 'safety' | undefined;
const stepNumbers: Record<BowelStep, number> = { type: 1, feeling: 2, sensations: 3, pain: 4, bloating: 4, urgency: 4, time: 5 };
const feelingSymbols = ['☺', '●', '◐', '×'];
const severitySymbols = ['☺', '◐', '×'];

/** New and existing records share the Web prototype's quick path and optional detail steps. */
export function BowelEditorScreen({ id }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('bowel');
  const { records, status, initialize } = useAppStore();
  const record = id ? records.find((item): item is BowelRecord => item.id === id && item.kind === 'bowel') : undefined;
  const back = () => router.replace(record
    ? { pathname: '/diary', params: { date: record.localDate } }
    : id ? '/diary' : '/');

  if (status === 'idle' || status === 'loading') return (
    <Screen title={t(id ? 'editTitle' : 'title')} onBack={back} backLabel={t('back')}>
      <View style={{ gap: theme.spacing.md }}>
        <ActivityIndicator color={theme.colors.text.primary} />
        <AppText>{t('loading')}</AppText>
      </View>
    </Screen>
  );
  if (status === 'error') return (
    <Screen title={t('title')} onBack={back} backLabel={t('back')}>
      <View style={{ gap: theme.spacing.md }}>
        <AppText>{t('loadError')}</AppText>
        <Button label={t('retry')} onPress={() => void initialize().catch(() => undefined)} />
      </View>
    </Screen>
  );
  if (id && !record) return (
    <Screen title={t('missing')} onBack={back} backLabel={t('back')}>
      <Button label={t('back')} variant="secondary" onPress={back} />
    </Screen>
  );
  return <BowelEditorForm key={id ?? 'new'} record={record} />;
}

function BowelEditorForm({ record }: { record?: BowelRecord }) {
  const theme = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation('bowel');
  const { createRecord, updateRecord } = useAppStore();
  const { width, fontScale } = useWindowDimensions();
  const [form, setForm] = useState(() => createForm(record));
  const [step, setStep] = useState<BowelStep>('type');
  const [sheet, setSheet] = useState<SheetName>();
  const [warning, setWarning] = useState<WarningSign>();
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [showNote, setShowNote] = useState(Boolean(record?.details.note));
  const [forceTimeUpdate, setForceTimeUpdate] = useState(false);
  const [gridWidth, setGridWidth] = useState(Math.min(width, theme.controls.contentWidth) - theme.spacing.md * 2);
  const saveInProgress = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const exit = useCallback(() => {
    if (!saveInProgress.current) router.replace(record
      ? { pathname: '/diary', params: { date: record.localDate } }
      : '/');
  }, [record, router]);
  const back = useCallback(() => {
    if (saveInProgress.current) return;
    if (step === 'type') exit();
    else setStep(adjacentStep(form, step, -1));
  }, [exit, form, step]);
  const returnFromWarning = useCallback(() => setWarning(undefined), []);

  useEffect(() => {
    if (step === 'type' || warning) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (saveInProgress.current) return false;
      back();
      return true;
    });
    return () => listener.remove();
  }, [back, step, warning]);

  const rowStyle = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: theme.spacing.sm };
  const readableWidth = gridWidth / fontScale;
  const shapeColumns = readableWidth >= theme.controls.minimumTouchTarget * 10 ? 4 : readableWidth >= theme.controls.minimumTouchTarget * 6 ? 2 : 1;
  const detailColumns = readableWidth >= theme.controls.minimumTouchTarget * 6 ? 2 : 1;
  const severityColumns = readableWidth >= theme.controls.minimumTouchTarget * 6 ? 3 : 1;
  const cellStyle = (columns: number) => ({ width: (gridWidth - theme.spacing.sm * (columns - 1)) / columns });
  const patch = (value: Partial<BowelForm>) => {
    if (!saveInProgress.current) {
      setForm((current) => ({ ...current, ...value }));
      setSaveFailed(false);
    }
  };

  const save = async () => {
    if (saveInProgress.current || form.stoolType === undefined || warning) return;
    saveInProgress.current = true;
    setSaving(true);
    setSaveFailed(false);
    const fail = () => { setSaveFailed(true); saveInProgress.current = false; setSaving(false); };
    let draft: RecordDraft;
    try {
      draft = createDraft(form, Intl.DateTimeFormat().resolvedOptions().timeZone, record, forceTimeUpdate);
    } catch { fail(); return; }
    await persistDraft(draft, record?.id, { createRecord, updateRecord }, {
      isActive: () => mounted.current,
      onFailed: fail,
      onSaved: (saved) => {
        useFeedbackStore.getState().show(t(record ? 'updated' : 'saved'));
        router.replace(record ? { pathname: '/diary', params: { date: saved.localDate } } : '/');
      },
    });
  };

  if (warning) return <SafetyStopScreen warning={warning} onBack={returnFromWarning} />;

  const typeName = typeof form.stoolType === 'number' ? t(`types.${form.stoolType}`) : t('unknown');
  const heading = step === 'type' ? 'What is the shape this time?'
    : step === 'feeling' ? (typeof form.stoolType === 'number' ? `Type ${form.stoolType}` : t('unknown'))
    : step === 'sensations' ? t('symptomsHeading')
    : step === 'pain' ? t('painTitle')
    : step === 'bloating' ? t('bloating')
    : step === 'urgency' ? t('urgency') : t('whenHeading');
  const timeLabel = `${new Intl.DateTimeFormat(i18n.resolvedLanguage, { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(`${form.date}T12:00:00`))} · ${form.time}`;
  const canContinue = form.stoolType !== undefined && (step !== 'feeling' || form.feeling !== 'unrecorded');
  const finalStep = step === 'type' || step === 'time';

  return (
    <Screen
      // Each step gets a fresh scroll position so a long shape grid cannot
      // leave the next question scrolled past its heading.
      key={step}
      title={heading}
      subtitle={undefined}
      onBack={back}
      backLabel={t('back')}
      maxWidth={600}
      flowBrand
      flowEyebrow={`${t('title')} · ${record ? t('editLabel') : t('quickLabel')}`}
      flowStep={stepNumbers[step]}
      flowTotal={5}
      right={<IconButton icon={X} label={t('close')} onPress={exit} disabled={saving} />}
      footer={(
        <View style={{ gap: theme.spacing.xs }}>
          {saveFailed && <AppText tone="danger" accessibilityRole="alert" accessibilityLiveRegion="assertive">{t('saveError')}</AppText>}
          <Button
            label={finalStep ? t(record ? 'saveChanges' : 'saveEntry') : t('continue')}
            icon={ArrowRight}
            onPress={finalStep ? () => void save() : () => setStep(adjacentStep(form, step, 1))}
            loading={saving}
            disabled={saving || (finalStep ? form.stoolType === undefined : !canContinue)}
            testID={finalStep ? 'bowel-save' : 'bowel-continue'}
          />
          {step === 'type' && <Button label={t('more')} variant="text" icon={ArrowRight} onPress={() => setStep('feeling')} disabled={saving || form.stoolType === undefined} testID="bowel-more" />}
        </View>
      )}
    >
      <View style={{ gap: theme.spacing.lg }} onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}>
        {step === 'type' && (
          <View style={{ gap: theme.spacing.sm }}>
            <View style={rowStyle}>
              {stoolTypes.map((type) => (
                <View key={type} style={cellStyle(shapeColumns)}>
                  <Choice label={t(`types.${type}`)} badge={String(type)} layout="tile" density="compact" icon={<StoolShape type={type} />} selected={form.stoolType === type} onPress={() => patch({ stoolType: type })} disabled={saving} style={{ flex: 1, minHeight: 126 }} testID={`bowel-type-${type}`} />
                </View>
              ))}
            </View>
            <Choice label={t('unknown')} icon={CircleHelp} density="compact" selected={form.stoolType === 'unknown'} onPress={() => patch({ stoolType: 'unknown' })} disabled={saving} style={{ borderStyle: form.stoolType === 'unknown' ? 'solid' : 'dashed' }} testID="bowel-type-unknown" />
            <Button label={t('examples')} variant="text" onPress={() => setSheet('examples')} disabled={saving} />
            <Button label={t('safety.entry')} variant="secondary" icon={AlertTriangle} onPress={() => setSheet('safety')} disabled={saving} testID="bowel-safety" />
          </View>
        )}

        {step === 'feeling' && (
          <View style={{ gap: theme.spacing.lg }}>
            <Card style={{ backgroundColor: theme.colors.entry.bowel.bg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <StoolShape type={form.stoolType} />
                <View style={{ flex: 1, gap: theme.spacing.xs }}>
                  <AppText variant="label" style={{ color: theme.colors.entry.bowel.fg }}>{typeName}</AppText>
                  {typeof form.stoolType === 'number' && <AppText variant="caption" style={{ color: theme.colors.entry.bowel.fg }}>{t(`descriptions.${form.stoolType}`)}</AppText>}
                </View>
              </View>
            </Card>
            <AppText variant="label">{t('feeling')}</AppText>
            <View style={rowStyle}>
              {feelings.map((feeling, index) => (
                <View key={feeling} style={cellStyle(detailColumns)}>
                  <Choice label={t(`feelings.${feeling}`)} density="compact" icon={<AppText variant="sectionTitle">{feelingSymbols[index]}</AppText>} selected={form.feeling === feeling} onPress={() => patch({ feeling })} disabled={saving} style={{ flex: 1 }} />
                </View>
              ))}
            </View>
          </View>
        )}

        {step === 'sensations' && (
          <View style={{ gap: theme.spacing.lg }}>
            <View style={rowStyle}>
              {sensations.map((sensation) => (
                <View key={sensation} style={cellStyle(detailColumns)}>
                  <Choice label={t(`sensations.${sensation}`)} density="compact" selectionRole="checkbox" selected={form.sensations.includes(sensation)} onPress={() => { if (!saveInProgress.current) setForm((current) => toggleSensation(current, sensation)); }} disabled={saving} style={{ flex: 1 }} testID={`bowel-sensation-${sensation}`} />
                </View>
              ))}
              <View style={cellStyle(detailColumns)}><Choice label={t('none')} density="compact" selected={!form.sensations.length} onPress={() => patch({ sensations: [] })} disabled={saving} style={{ flex: 1 }} /></View>
            </View>
            <Button label={t('safety.signsTitle')} variant="secondary" icon={AlertTriangle} onPress={() => setSheet('safety')} disabled={saving} testID="bowel-safety" />
          </View>
        )}

        {step === 'pain' && (
          <View style={{ gap: theme.spacing.lg }}>
            <Slider label={t('painLevel')} value={form.painLevel} onValueChange={(value) => patch({ painLevel: Math.max(0, Math.min(10, Math.round(value))) as BowelForm['painLevel'] })} minimumValue={0} maximumValue={10} step={1} testID="bowel-pain-slider" />
            <AppText variant="label">{t('painLocation')}</AppText>
            <View style={rowStyle}>
              {painLocations.map((location) => (
                <View key={location} style={cellStyle(severityColumns)}>
                  <Choice label={t(`locations.${location}`)} density="compact" selected={form.painLocation === location} onPress={() => patch({ painLocation: location })} disabled={saving} style={{ flex: 1 }} />
                </View>
              ))}
            </View>
          </View>
        )}

        {(step === 'bloating' || step === 'urgency') && (
          <View style={rowStyle}>
            {(step === 'bloating' ? severityLevels : urgencyLevels).map((value, index) => (
              <View key={value} style={cellStyle(severityColumns)}>
                <Choice
                  label={step === 'bloating' ? t(`severities.${value}`) : t(`urgencies.${value}`)}
                  layout="tile"
                  density="compact"
                  icon={<AppText variant="pageTitle" style={{ color: theme.colors.severity[severityLevels[index]].fg }}>{severitySymbols[index]}</AppText>}
                  selected={step === 'bloating' ? form.bloating === value : form.urgency === value}
                  onPress={() => patch(step === 'bloating' ? { bloating: value as BowelForm['bloating'] } : { urgency: value as BowelForm['urgency'] })}
                  tone={severityLevels[index]}
                  disabled={saving}
                  style={{ flex: 1 }}
                />
              </View>
            ))}
          </View>
        )}

        {step === 'time' && (
          <View style={{ gap: theme.spacing.md }}>
            <Button label={timeLabel} variant="secondary" icon={Clock3} onPress={() => setSheet('time')} disabled={saving} />
            <Button label={showNote ? t('hideNote') : t('addNote')} variant="text" onPress={() => setShowNote((value) => !value)} disabled={saving} />
            {showNote && <TextInput value={form.note} onChangeText={(note) => patch({ note })} editable={!saving} multiline accessibilityLabel={t('note')} placeholder={t('notePlaceholder')} placeholderTextColor={theme.colors.text.secondary} style={{ ...theme.typography.body, padding: theme.spacing.md, minHeight: theme.controls.minimumTouchTarget * 2, borderRadius: theme.radius.md, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, backgroundColor: theme.colors.surface.card, color: theme.colors.text.primary, textAlignVertical: 'top' }} />}
          </View>
        )}
      </View>

      <Sheet visible={sheet === 'examples'} title={t('examples')} onClose={() => setSheet(undefined)} closeLabel={t('close')}>
        <View style={{ gap: theme.spacing.sm }}>
          {stoolTypes.map((type) => <Choice key={type} label={`${type} · ${t(`types.${type}`)}`} description={t(`descriptions.${type}`)} icon={<StoolShape type={type} />} selected={form.stoolType === type} onPress={() => { patch({ stoolType: type }); setSheet(undefined); }} />)}
        </View>
      </Sheet>
      <Sheet visible={sheet === 'safety'} title={t('safety.signsTitle')} onClose={() => setSheet(undefined)} closeLabel={t('close')}>
        <View style={{ gap: theme.spacing.sm }}>
          {warningSigns.map((sign) => <Choice key={sign} label={t(`safety.signs.${sign}`)} selected={false} onPress={() => { setSheet(undefined); setWarning(sign); }} />)}
        </View>
      </Sheet>
      <DateTimeSheet visible={sheet === 'time'} date={form.date} time={form.time} onClose={() => setSheet(undefined)} onApply={(date, time, resetTime) => { patch({ date, time }); if (resetTime) setForceTimeUpdate(true); setSheet(undefined); }} />
    </Screen>
  );
}
