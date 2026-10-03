import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TextInput, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Choice, Screen, Sheet, Slider, useTheme } from '@/design-system';
import type { BowelRecord, RecordDraft } from '@/domain/records';
import { useAppStore } from '@/state/useAppStore';
import { useFeedbackStore } from '@/state/useFeedbackStore';
import { DateTimeSheet } from './components/DateTimeSheet';
import { SafetyStopScreen } from './components/SafetyStopScreen';
import { persistDraft } from './persistDraft';
import {
  createDraft, createForm, feelings, painLocations, sensations, severityLevels,
  stoolTypes, toggleSensation, urgencyLevels, warningSigns, type BowelForm, type WarningSign,
} from './model';

interface Props { id?: string }
type SheetName = 'examples' | 'time' | 'safety' | undefined;

/** New and existing records use this same editor, including every optional branch. */
export function BowelEditorScreen({ id }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('bowel');
  const { records, status, initialize } = useAppStore();
  const record = id ? records.find((item): item is BowelRecord => item.id === id && item.kind === 'bowel') : undefined;
  const back = () => router.replace(record
    ? { pathname: '/diary', params: { date: record.localDate } }
    : id ? '/diary' : '/');

  if (status === 'idle' || status === 'loading') {
    return (
      <Screen title={t(id ? 'editTitle' : 'title')} onBack={back} backLabel={t('back')}>
        <View style={{ gap: theme.spacing.md }}>
          <ActivityIndicator color={theme.colors.text.primary} />
          <AppText>{t('loading')}</AppText>
        </View>
      </Screen>
    );
  }
  if (status === 'error') {
    return (
      <Screen title={t('title')} onBack={back} backLabel={t('back')}>
        <View style={{ gap: theme.spacing.md }}>
          <AppText>{t('loadError')}</AppText>
          <Button label={t('retry')} onPress={() => void initialize().catch(() => undefined)} />
        </View>
      </Screen>
    );
  }
  if (id && !record) {
    return (
      <Screen title={t('missing')} onBack={back} backLabel={t('back')}>
        <Button label={t('back')} variant="secondary" onPress={back} />
      </Screen>
    );
  }
  // Keying the draft prevents an edit route from retaining another record's unsaved values.
  return <BowelEditorForm key={id ?? 'new'} record={record} />;
}

function BowelEditorForm({ record }: { record?: BowelRecord }) {
  const theme = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation('bowel');
  const { createRecord, updateRecord } = useAppStore();
  const { width, fontScale } = useWindowDimensions();
  const [form, setForm] = useState(() => createForm(record));
  const [expanded, setExpanded] = useState(() => Boolean(record && (
    record.details.feeling !== 'unrecorded' || record.details.sensations.length || record.details.note
  )));
  const [sheet, setSheet] = useState<SheetName>();
  const [warning, setWarning] = useState<WarningSign>();
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [forceTimeUpdate, setForceTimeUpdate] = useState(false);
  const saveInProgress = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const exit = () => {
    if (!saveInProgress.current) router.replace(record
      ? { pathname: '/diary', params: { date: record.localDate } }
      : '/');
  };
  const returnFromWarning = useCallback(() => setWarning(undefined), []);
  const rowStyle = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: theme.spacing.sm };
  const singleColumn = width / fontScale < theme.controls.minimumTouchTarget * 7;
  const optionStyle = { flexBasis: singleColumn ? '100%' as const : '45%' as const, flexGrow: 1 };
  const sectionStyle = { gap: theme.spacing.md };
  const stoolIcons = ['🐑', '🥔', '🌭', '🪵', '🫧', '🥣', '💧'];
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
    const fail = () => {
      setSaveFailed(true);
      saveInProgress.current = false;
      setSaving(false);
    };
    let draft: RecordDraft;
    try {
      draft = createDraft(form, Intl.DateTimeFormat().resolvedOptions().timeZone, record, forceTimeUpdate);
    } catch {
      fail();
      return;
    }
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

  const timeLabel = `${new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(`${form.date}T12:00:00`))} · ${form.time}`;

  return (
    <Screen title={t(record ? 'editTitle' : 'title')} onBack={exit} backLabel={t('back')} footer={(
      <View style={{ gap: theme.spacing.sm }}>
        {saveFailed && <AppText accessibilityRole="alert" accessibilityLiveRegion="assertive">{t('saveError')}</AppText>}
        <Button
          label={t(record ? 'saveChanges' : 'save')}
          onPress={() => void save()}
          loading={saving}
          disabled={form.stoolType === undefined || saving}
          testID="bowel-save"
        />
      </View>
    )}>
      <View style={{ gap: theme.spacing.lg }}>
        <View style={sectionStyle}>
          <AppText variant="sectionTitle">{t('shape')}</AppText>
          <View style={rowStyle}>
            {stoolTypes.map((type, index) => (
              <View key={type} style={optionStyle}>
                <Choice
                  label={`${type} · ${t(`types.${type}`)}`}
                  density="compact"
                  style={{ flex: 1 }}
                  icon={<AppText>{stoolIcons[index]}</AppText>}
                  selected={form.stoolType === type}
                  onPress={() => patch({ stoolType: type })}
                  testID={`bowel-type-${type}`}
                />
              </View>
            ))}
            <View style={optionStyle}>
              <Choice density="compact" style={{ flex: 1 }} label={t('unknown')} icon={<AppText>?</AppText>} selected={form.stoolType === 'unknown'} onPress={() => patch({ stoolType: 'unknown' })} testID="bowel-type-unknown" />
            </View>
          </View>
          <Button label={t('examples')} variant="secondary" onPress={() => setSheet('examples')} disabled={saving} />
        </View>

        <Button label={t(expanded ? 'less' : 'more')} variant="secondary" onPress={() => setExpanded((value) => !value)} disabled={saving} />
        {expanded && (
          <View style={{ gap: theme.spacing.lg }}>
            <View style={sectionStyle}>
              <AppText variant="sectionTitle">{t('feeling')}</AppText>
              <View style={rowStyle}>
                {feelings.map((feeling) => (
                  <View key={feeling} style={optionStyle}>
                    <Choice label={t(`feelings.${feeling}`)} selected={form.feeling === feeling} onPress={() => patch({ feeling: form.feeling === feeling ? 'unrecorded' : feeling })} />
                  </View>
                ))}
              </View>
            </View>
            <View style={sectionStyle}>
              <AppText variant="sectionTitle">{t('symptoms')}</AppText>
              <View style={rowStyle}>
                {sensations.map((sensation) => (
                  <View key={sensation} style={optionStyle}>
                    <Choice
                      label={t(`sensations.${sensation}`)}
                      selectionRole="checkbox"
                      selected={form.sensations.includes(sensation)}
                      onPress={() => { if (!saveInProgress.current) setForm((current) => toggleSensation(current, sensation)); }}
                      testID={`bowel-sensation-${sensation}`}
                    />
                  </View>
                ))}
                <View style={optionStyle}>
                  <Choice label={t('none')} selected={!form.sensations.length} onPress={() => patch({ sensations: [] })} />
                </View>
              </View>
            </View>
            {form.sensations.includes('pain') && (
              <Card>
                <View style={sectionStyle}>
                  <Slider label={t('painLevel', { value: form.painLevel })} value={form.painLevel} onValueChange={(value) => patch({ painLevel: Math.max(0, Math.min(10, Math.round(value))) as BowelForm['painLevel'] })} minimumValue={0} maximumValue={10} step={1} testID="bowel-pain-slider" />
                  <AppText variant="label">{t('painLocation')}</AppText>
                  <View style={rowStyle}>
                    {painLocations.map((location) => (
                      <View key={location} style={optionStyle}>
                        <Choice label={t(`locations.${location}`)} selected={form.painLocation === location} onPress={() => patch({ painLocation: location })} />
                      </View>
                    ))}
                  </View>
                </View>
              </Card>
            )}
            {form.sensations.includes('bloating') && (
              <View style={sectionStyle}>
                <AppText variant="sectionTitle">{t('bloating')}</AppText>
                {severityLevels.map((severity) => <Choice key={severity} label={t(`severities.${severity}`)} selected={form.bloating === severity} onPress={() => patch({ bloating: severity })} tone={severity} />)}
              </View>
            )}
            {form.sensations.includes('urgency') && (
              <View style={sectionStyle}>
                <AppText variant="sectionTitle">{t('urgency')}</AppText>
                {urgencyLevels.map((urgency, index) => <Choice key={urgency} label={t(`urgencies.${urgency}`)} selected={form.urgency === urgency} onPress={() => patch({ urgency })} tone={severityLevels[index]} />)}
              </View>
            )}
            <View style={sectionStyle}>
              <AppText variant="label">{t('note')}</AppText>
              <TextInput
                value={form.note}
                onChangeText={(note) => patch({ note })}
                editable={!saving}
                multiline
                accessibilityLabel={t('note')}
                placeholder={t('notePlaceholder')}
                placeholderTextColor={theme.colors.text.secondary}
                style={{
                  ...theme.typography.body,
                  padding: theme.spacing.md,
                  minHeight: theme.controls.minimumTouchTarget * 2,
                  borderRadius: theme.radius.md,
                  borderWidth: theme.controls.borderWidth,
                  borderColor: theme.colors.border.default,
                  backgroundColor: theme.colors.surface.card,
                  color: theme.colors.text.primary,
                  textAlignVertical: 'top',
                }}
              />
            </View>
          </View>
        )}

        <View style={sectionStyle}>
          <AppText variant="label">{t('when')}</AppText>
          <Button label={timeLabel} variant="secondary" onPress={() => setSheet('time')} disabled={saving} />
        </View>
        <Button label={t('safety.entry')} variant="secondary" onPress={() => setSheet('safety')} disabled={saving} testID="bowel-safety" />
      </View>

      <Sheet visible={sheet === 'examples'} title={t('examples')} onClose={() => setSheet(undefined)} closeLabel={t('close')}>
        <View style={{ gap: theme.spacing.md }}>
          {stoolTypes.map((type) => (
            <Choice key={type} label={`${type} · ${t(`types.${type}`)}`} description={t(`descriptions.${type}`)} selected={form.stoolType === type} onPress={() => { patch({ stoolType: type }); setSheet(undefined); }} />
          ))}
        </View>
      </Sheet>
      <Sheet visible={sheet === 'safety'} title={t('safety.signsTitle')} onClose={() => setSheet(undefined)} closeLabel={t('close')}>
        <View style={{ gap: theme.spacing.sm }}>
          {warningSigns.map((sign) => (
            <Choice key={sign} label={t(`safety.signs.${sign}`)} selected={false} onPress={() => { setSheet(undefined); setWarning(sign); }} />
          ))}
        </View>
      </Sheet>
      <DateTimeSheet visible={sheet === 'time'} date={form.date} time={form.time} onClose={() => setSheet(undefined)} onApply={(date, time, resetTime) => { patch({ date, time }); if (resetTime) setForceTimeUpdate(true); setSheet(undefined); }} />
    </Screen>
  );
}
