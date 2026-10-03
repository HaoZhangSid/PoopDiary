import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Check, Coffee, Droplets, Leaf, Plus, Wine, X, Zap, type LucideIcon } from 'lucide-react-native';
import { AppText, Button, Card, IconButton, Screen, Slider, useTheme } from '@/design-system';
import type { DiaryRecord, RecordDraft } from '@/domain/records';
import { localDateKey } from '@/domain/records';
import { useAppStore } from '@/state/useAppStore';
import { useFeedbackStore } from '@/state/useFeedbackStore';
import { persistDraft } from '@/state/persistDraft';
import { amountPresets, createDraft, createForm, type BeverageCode, type WaterForm } from './model';

interface Props { id?: string }
type WaterRecord = Extract<DiaryRecord, { kind: 'water' }>;
const commonBeverages: BeverageCode[] = ['water', 'coffee', 'tea', 'soda', 'juice', 'milk'];
const extraBeverages: BeverageCode[] = ['alcohol', 'other'];
const icons: Record<BeverageCode, LucideIcon> = {
  water: Droplets, coffee: Coffee, tea: Leaf, soda: Zap, juice: Zap, milk: Droplets, alcohol: Wine, other: Plus,
};

function DrinkChoice({ code, selected, label, onPress, disabled }: { code: BeverageCode; selected: boolean; label: string; onPress: () => void; disabled?: boolean }) {
  const theme = useTheme();
  const Icon = icons[code];
  const tone = theme.colors.beverage[code === 'other' ? 'custom' : code];
  return <Pressable
    testID={`water-beverage-${code}`}
    accessibilityRole="radio"
    accessibilityLabel={label}
    accessibilityState={{ checked: selected, disabled }}
    aria-checked={selected}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => ({
      minHeight: theme.controls.minimumTouchTarget,
      flexGrow: 1,
      flexBasis: theme.controls.minimumTouchTarget * 2.35,
      padding: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderWidth: selected ? theme.controls.selectedBorderWidth : theme.controls.borderWidth,
      borderColor: selected ? tone.fg : theme.colors.border.control,
      backgroundColor: pressed || selected ? tone.bg : theme.colors.surface.card,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xs,
      opacity: disabled ? 0.55 : 1,
    })}
  >
    <Icon size={theme.controls.smallIcon} color={tone.fg} />
    <AppText variant="label" style={{ color: tone.fg, flexShrink: 1, textAlign: 'center' }}>{label}</AppText>
    {selected && <Check size={theme.controls.smallIcon} color={tone.fg} />}
  </Pressable>;
}

/** Single-screen drink logger ported from the Web prototype. New and edit share this editor. */
export function WaterEditorScreen({ id }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation(['water', 'common']);
  const { records, status, initialize } = useAppStore();
  const record = id ? records.find((item): item is WaterRecord => item.id === id && item.kind === 'water') : undefined;
  const back = () => router.replace(record ? { pathname: '/diary', params: { date: record.localDate } } : id ? '/diary' : '/');

  if (status === 'idle' || status === 'loading') return <Screen title={t(id ? 'editTitle' : 'addTitle')} onBack={back} backLabel={t('back')}><View style={{ gap: theme.spacing.md }}><ActivityIndicator color={theme.colors.text.primary} /><AppText>{t('loading')}</AppText></View></Screen>;
  if (status === 'error') return <Screen title={t('title')} onBack={back} backLabel={t('back')}><View style={{ gap: theme.spacing.md }}><AppText>{t('loadError')}</AppText><Button label={t('retry')} onPress={() => void initialize().catch(() => undefined)} /></View></Screen>;
  if (id && !record) return <Screen title={t('missing')} onBack={back} backLabel={t('back')}><Button label={t('back')} variant="secondary" onPress={back} /></Screen>;
  return <WaterEditorForm key={id ?? 'new'} record={record} />;
}

function WaterEditorForm({ record }: { record?: WaterRecord }) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation(['water', 'common']);
  const { records, createRecord, updateRecord } = useAppStore();
  const { width } = useWindowDimensions();
  const [form, setForm] = useState<WaterForm>(() => createForm(record));
  const [showMore, setShowMore] = useState(record?.details.beverage === 'alcohol' || record?.details.beverage === 'other');
  const [showCustom, setShowCustom] = useState(record?.details.beverage === 'other');
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const mounted = useRef(true);
  const saveInProgress = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const today = localDateKey(new Date());
  const todayTotal = records.filter((entry): entry is WaterRecord => entry.kind === 'water' && entry.localDate === today).reduce((sum, entry) => sum + entry.details.volumeMl, 0);
  const progress = Math.min(100, Math.round(todayTotal / 20));
  const patch = (value: Partial<WaterForm>) => { if (!saveInProgress.current) { setForm((current) => ({ ...current, ...value })); setSaveFailed(false); } };
  const selectBeverage = (beverage: BeverageCode) => { patch({ beverage, ...(beverage === 'other' ? {} : { customName: '' }) }); if (beverage === 'other') setShowCustom(true); };
  const exit = useCallback(() => { if (!saveInProgress.current) router.replace(record ? { pathname: '/diary', params: { date: record.localDate } } : '/'); }, [record, router]);
  const save = async () => {
    if (saveInProgress.current || !form.volumeMl) return;
    saveInProgress.current = true; setSaving(true); setSaveFailed(false);
    let draft: RecordDraft;
    try { draft = createDraft(form, Intl.DateTimeFormat().resolvedOptions().timeZone, record); }
    catch { saveInProgress.current = false; setSaving(false); setSaveFailed(true); return; }
    await persistDraft(draft, record?.id, { createRecord, updateRecord }, {
      isActive: () => mounted.current,
      onFailed: () => { setSaveFailed(true); saveInProgress.current = false; setSaving(false); },
      onSaved: (saved) => { useFeedbackStore.getState().show(t(record ? 'updated' : 'saved', { ns: 'water' })); router.replace(record ? { pathname: '/diary', params: { date: saved.localDate } } : '/'); },
    });
  };
  const selectedLabel = form.beverage === 'other' && form.customName.trim() ? form.customName.trim() : t(`beverages.${form.beverage}`, { ns: 'water' });
  const isNarrow = width < theme.controls.minimumTouchTarget * 8;
  return <Screen
    title={t(record ? 'editTitle' : 'addTitle')}
    subtitle={t('defaultWater')}
    onBack={exit}
    backLabel={t('back')}
    right={<IconButton icon={X} label={t('close')} onPress={exit} disabled={saving} />}
    footer={<View style={{ gap: theme.spacing.xs }}>{saveFailed && <AppText tone="danger" accessibilityRole="alert" accessibilityLiveRegion="assertive">{t('saveError')}</AppText>}<Button label={record ? t('saveChanges') : t('save', { amount: form.volumeMl, drink: selectedLabel })} onPress={() => { void save(); }} loading={saving} disabled={saving || form.volumeMl < 1} testID="water-save" /></View>}
  >
    <View style={{ gap: theme.spacing.lg }}>
      <Card style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: theme.spacing.sm }}>
          <AppText variant="label">{t('todayTotal')}</AppText><AppText variant="caption" tone="secondary">{todayTotal} {t('goal')}</AppText>
        </View>
        <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 2000, now: todayTotal }} style={{ height: theme.spacing.sm, borderRadius: theme.radius.pill, overflow: 'hidden', backgroundColor: theme.colors.entry.water.bg }}><View style={{ height: '100%', width: `${progress}%`, backgroundColor: theme.colors.entry.water.fg }} /></View>
      </Card>

      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: theme.spacing.sm }}><AppText variant="sectionTitle">{t('chooseDrink')}</AppText><AppText variant="caption" tone="secondary">{selectedLabel}</AppText></View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {commonBeverages.map((code) => <DrinkChoice key={code} code={code} selected={form.beverage === code} label={t(`beverages.${code}`)} onPress={() => selectBeverage(code)} disabled={saving} />)}
        </View>
        {!showMore && <Button label={t('moreDrinks')} variant="text" onPress={() => setShowMore(true)} disabled={saving} />}
        {showMore && <View style={{ gap: theme.spacing.sm }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{extraBeverages.map((code) => <DrinkChoice key={code} code={code} selected={form.beverage === code} label={t(`beverages.${code}`)} onPress={() => selectBeverage(code)} disabled={saving} />)}</View><Button label={t('fewerDrinks')} variant="text" onPress={() => setShowMore(false)} disabled={saving} /></View>}
        {showCustom && form.beverage === 'other' && <View style={{ flexDirection: isNarrow ? 'column' : 'row', gap: theme.spacing.sm, alignItems: isNarrow ? undefined : 'center' }}><TextInput value={form.customName} onChangeText={(customName) => patch({ customName })} editable={!saving} autoFocus accessibilityLabel={t('customPlaceholder')} placeholder={t('customPlaceholder')} placeholderTextColor={theme.colors.text.secondary} style={{ flex: 1, minHeight: theme.controls.minimumTouchTarget, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.control, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, ...theme.typography.body, color: theme.colors.text.primary, backgroundColor: theme.colors.surface.card }} /><Button label={t('clearCustom')} variant="secondary" onPress={() => { patch({ beverage: 'water', customName: '' }); setShowCustom(false); }} disabled={saving} /></View>}
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: theme.spacing.sm }}><AppText variant="sectionTitle">{t('amount')}</AppText><AppText variant="sectionTitle" style={{ color: theme.colors.entry.water.fg }}>{form.volumeMl} <AppText variant="caption" style={{ color: theme.colors.entry.water.fg }}>ml</AppText></AppText></View>
        <Slider label={t('volume')} value={form.volumeMl} onValueChange={(value) => patch({ volumeMl: Math.round(value / 50) * 50 })} minimumValue={100} maximumValue={1000} step={50} tone="water" testID="water-volume-slider" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{amountPresets.map((amount) => <View key={amount} style={{ flex: 1, minWidth: theme.controls.minimumTouchTarget * 2 }}><Button label={t(`presets.${amount}`)} variant={form.volumeMl === amount ? 'primary' : 'secondary'} onPress={() => patch({ volumeMl: amount })} disabled={saving} testID={`water-amount-${amount}`} /></View>)}</View>
      </View>
    </View>
  </Screen>;
}
