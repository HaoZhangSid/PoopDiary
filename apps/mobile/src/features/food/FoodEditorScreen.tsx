import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, ChevronRight, FileText, Keyboard, Mic, Package, Search, Utensils, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Choice, IconButton, Screen, Stepper, useTheme } from '@/design-system';
import type { DiaryRecord, FoodDetails, FoodItem, FoodUnit, RecordDraft } from '@/domain/records';
import { currentTime, localDateKey, localEventTimestamp } from '@/domain/records';
import { useAppStore } from '@/state/useAppStore';
import { useFeedbackStore } from '@/state/useFeedbackStore';
import { persistDraft } from '@/state/persistDraft';

interface Props { id?: string; quick?: boolean }
type FoodRecord = Extract<DiaryRecord, { kind: 'food' }>;
type Method = FoodDetails['method'];
type Step = 'method' | 'quick' | 'photoType' | 'voice' | 'photo' | 'package' | 'ingredients' | 'nutrition' | 'items' | 'edit' | 'meal';
type PhotoMode = 'food' | 'package' | 'nutrition';
const foods = ['Oatmeal', 'Porridge', 'Banana', 'Coffee', 'Egg', 'Yoghurt', 'Rice', 'Chicken', 'Broccoli', 'Toast', 'Apple', 'Milk'];
const units: FoodUnit[] = ['portion', 'cup', 'piece', 'g', 'ml'];

const defaults: FoodItem[] = [
  { name: 'Oatmeal', quantity: 1, unit: 'cup' },
  { name: 'Banana', quantity: 1, unit: 'piece' },
  { name: 'Coffee', quantity: 1, unit: 'cup' },
];

function draftFor(items: FoodItem[], meal: FoodDetails['meal'], method: Method, record?: FoodRecord): RecordDraft {
  const date = record?.localDate ?? localDateKey(new Date());
  const time = record ? new Intl.DateTimeFormat('en-GB', { timeZone: record.timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(record.occurredAt)) : currentTime();
  return { kind: 'food', occurredAt: record?.occurredAt ?? localEventTimestamp(date, time), localDate: date, timeZone: record?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone, details: { meal, method, items } };
}

export function FoodEditorScreen({ id, quick = false }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('common');
  const { records, status, initialize } = useAppStore();
  const record = id ? records.find((item): item is FoodRecord => item.id === id && item.kind === 'food') : undefined;
  const back = () => router.replace(record ? { pathname: '/diary', params: { date: record.localDate } } : id ? '/diary' : '/');
  if (status === 'idle' || status === 'loading') return <Screen title={t('food')} onBack={back} backLabel={t('back')}><ActivityIndicator color={theme.colors.text.primary} /></Screen>;
  if (status === 'error') return <Screen title={t('food')} onBack={back} backLabel={t('back')}><Button label={t('retry')} onPress={() => void initialize().catch(() => undefined)} /></Screen>;
  if (id && !record) return <Screen title={t('missing')} onBack={back} backLabel={t('back')}><Button label={t('back')} variant="secondary" onPress={back} /></Screen>;
  return <FoodEditorForm key={`${id ?? 'new'}-${quick ? 'quick' : 'full'}`} record={record} quick={quick} />;
}

function FoodEditorForm({ record, quick = false }: { record?: FoodRecord; quick?: boolean }) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('common');
  const { t: foodT } = useTranslation('food');
  const { createRecord, updateRecord } = useAppStore();
  const original = record?.details.items ?? [];
  const [step, setStep] = useState<Step>(record ? 'items' : quick ? 'quick' : 'method');
  const [method, setMethod] = useState<Method>(record?.details.method ?? 'manual');
  const [photoMode, setPhotoMode] = useState<PhotoMode>('food');
  const [search, setSearch] = useState('');
  const [quickText, setQuickText] = useState('');
  const [items, setItems] = useState<FoodItem[]>(original.length ? original : []);
  const [selected, setSelected] = useState(0);
  const [meal, setMeal] = useState<FoodDetails['meal']>(record?.details.meal ?? 'breakfast');
  const [saving, setSaving] = useState(false);
  const mounted = useRef(true);
  const saveInProgress = useRef(false);
  useEffect(() => () => { mounted.current = false; }, []);
  const exit = () => { if (!saveInProgress.current) router.replace(record ? { pathname: '/diary', params: { date: record.localDate } } : '/'); };
  const finish = async () => {
    if (saveInProgress.current || !items.length) return;
    saveInProgress.current = true; setSaving(true);
    await persistDraft(draftFor(items, meal, method, record), record?.id, { createRecord, updateRecord }, {
      isActive: () => mounted.current,
      onFailed: () => { saveInProgress.current = false; setSaving(false); },
      onSaved: () => { useFeedbackStore.getState().show(t(record ? 'updated' : 'saved')); router.replace(record ? '/diary' : '/'); },
    });
  };
  const add = (name: string) => { setItems((current) => [...current, { name, quantity: 1, unit: name === 'Banana' ? 'piece' : name === 'Coffee' ? 'cup' : 'portion' }]); setStep('items'); };
  const addQuickText = (value: string) => {
    setQuickText(value);
    const names = value.split(/[,+，、]/).map((item) => item.trim()).filter(Boolean);
    setItems(names.map((name) => ({ name, quantity: 1, unit: name.toLowerCase().includes('coffee') ? 'cup' : name.toLowerCase().includes('banana') ? 'piece' : 'portion' })));
  };
  const selectedItem = items[selected];
  const unitLabel = (unit: FoodUnit) => foodT(`units.${unit}`);
  const foodLabel = (name: string) => foodT(`foods.${name}`, { defaultValue: name });
  const setItem = (patch: Partial<FoodItem>) => setItems((current) => current.map((item, index) => index === selected ? { ...item, ...patch } : item));
  const title = step === 'method' || step === 'quick' ? foodT('title') : step === 'photoType' ? foodT('photoQuestion') : step === 'voice' ? foodT('sayWhatYouAte') : step === 'photo' ? (photoMode === 'food' ? foodT('photoRecognition') : photoMode === 'package' ? foodT('scanPackage') : foodT('scanNutrition')) : step === 'package' ? foodT('productFound') : step === 'ingredients' ? foodT('ingredients') : step === 'nutrition' ? foodT('nutrition') : step === 'edit' ? (selectedItem ? foodLabel(selectedItem.name) : t('food')) : step === 'meal' ? foodT('mealDetails') : foodT('title');
  const footer = step === 'meal' || step === 'quick' ? <Button label={record ? t('save') : foodT('saveMeal')} onPress={() => void finish()} loading={saving} disabled={saving || !items.length} /> : undefined;
  const flowStep = step === 'quick' ? 1 : step === 'method' ? 1 : step === 'photoType' || step === 'voice' ? 2 : step === 'photo' || step === 'package' || step === 'ingredients' || step === 'nutrition' || step === 'items' || step === 'edit' ? 3 : 4;
  return <Screen title={title} subtitle={undefined} onBack={() => { if (step === 'method' || step === 'quick') exit(); else if (step === 'photoType' || step === 'voice') setStep('method'); else if (step === 'photo') setStep('photoType'); else if (step === 'package') setStep('photo'); else if (step === 'ingredients') setStep('package'); else if (step === 'nutrition') setStep(photoMode === 'nutrition' ? 'photo' : 'ingredients'); else if (step === 'items') setStep(method === 'manual' ? 'method' : method === 'voice' ? 'voice' : photoMode === 'food' ? 'photo' : photoMode === 'package' ? 'package' : 'nutrition'); else if (step === 'edit') setStep('items'); else setStep('items'); }} maxWidth={600} flowBrand flowEyebrow={quick ? foodT('quickEyebrow') : foodT('step', { step: flowStep })} flowStep={quick ? undefined : flowStep} flowTotal={quick ? undefined : 4} right={<IconButton icon={X} label={t('close')} onPress={exit} disabled={saving} />} footer={footer}>
    {step === 'quick' && <View style={{ gap: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minHeight: theme.controls.minimumTouchTarget, paddingHorizontal: theme.spacing.md, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.card }}>
        <Utensils size={theme.controls.icon} color={theme.colors.text.secondary} />
        <TextInput value={quickText} onChangeText={addQuickText} placeholder={foodT('quickPlaceholder')} placeholderTextColor={theme.colors.text.secondary} style={{ flex: 1, ...theme.typography.body, color: theme.colors.text.primary }} />
      </View>
      <View style={{ gap: theme.spacing.sm }}><AppText variant="label">{foodT('eatOften')}</AppText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{[['Oatmeal + Banana', 'demo.oatmealBanana'], ['Rice + Chicken', 'demo.riceChicken'], ['Coffee + Toast', 'demo.coffeeToast']].map(([value, labelKey]) => <Button key={value} label={foodT(labelKey)} variant="secondary" onPress={() => addQuickText(value.replace(/\s*\+\s*/g, ', '))} />)}</View></View>
    </View>}
    {step === 'method' && <View style={{ gap: theme.spacing.sm }}>
      <Choice label={foodT('takePhoto')} icon={Camera} style={{ minHeight: 72 }} onPress={() => setStep('photoType')} />
      <Choice label={foodT('sayIt')} icon={Mic} style={{ minHeight: 72 }} onPress={() => { setMethod('voice'); setStep('voice'); }} />
      <Choice label={foodT('enterIt')} icon={Keyboard} style={{ minHeight: 72 }} onPress={() => { setMethod('manual'); setStep('items'); }} />
      <View style={{ marginTop: theme.spacing.lg + theme.spacing.sm, gap: theme.spacing.sm }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><AppText variant="caption">{foodT('recentLogs')}</AppText><Pressable onPress={() => setStep('items')}><AppText variant="caption">{foodT('viewAll')}</AppText></Pressable></View><View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>{['Oatmeal', 'Banana'].map((name) => <Pressable key={name} onPress={() => add(name)} style={{ flex: 1, minHeight: theme.controls.compactMetricHeight, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, backgroundColor: theme.colors.surface.card, gap: theme.spacing.xs }}><AppText variant="label">{foodLabel(name)}</AppText><AppText variant="caption" tone="secondary">{name === 'Oatmeal' ? foodT('yesterday') : foodT('eatOften')}</AppText></Pressable>)}</View></View>
    </View>}
    {step === 'photoType' && <View style={{ gap: theme.spacing.sm }}><Choice label={foodT('foodOnPlate')} icon={Utensils} onPress={() => { setMethod('photo-food'); setPhotoMode('food'); setStep('photo'); }} /><Choice label={foodT('packageFront')} icon={Package} onPress={() => { setMethod('photo-package'); setPhotoMode('package'); setStep('photo'); }} /><Choice label={foodT('nutritionLabel')} icon={FileText} onPress={() => { setMethod('photo-nutrition'); setPhotoMode('nutrition'); setStep('photo'); }} /></View>}
    {step === 'voice' && <View style={{ gap: theme.spacing.lg }}><Card style={{ alignItems: 'center', justifyContent: 'center', minHeight: theme.controls.choiceTileHeight * 2, gap: theme.spacing.md, backgroundColor: theme.colors.entry.symptom.bg }}><View style={{ width: theme.controls.choiceTileHeight - theme.spacing.md, height: theme.controls.choiceTileHeight - theme.spacing.md, borderRadius: theme.radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.entry.symptom.fg }}><Mic size={theme.controls.icon + theme.spacing.sm} color={theme.colors.surface.card} /></View><AppText variant="label">{foodT('pressToStart')}</AppText><AppText tone="secondary">{foodT('voiceExample')}</AppText></Card><Button label={foodT('startVoice')} icon={Mic} onPress={() => { setItems(defaults); setStep('items'); }} /></View>}
    {step === 'photo' && <View style={{ gap: theme.spacing.lg }}>
      <Card style={{ minHeight: 230, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, backgroundColor: theme.colors.surface.subtle }}><View style={{ width: 100, height: 100, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.entry.food.bg }}>{photoMode === 'food' ? <Utensils size={40} color={theme.colors.entry.food.fg} /> : photoMode === 'package' ? <Package size={40} color={theme.colors.entry.food.fg} /> : <FileText size={40} color={theme.colors.entry.food.fg} />}</View><AppText variant="label">{foodT('aiReady')}</AppText></Card>
      <Button label={photoMode === 'food' ? foodT('recognizeFood') : photoMode === 'package' ? foodT('readPackage') : foodT('readNutrition')} icon={Camera} onPress={() => { setItems(photoMode === 'food' ? [{ name: 'Rice', quantity: 1, unit: 'portion' }, { name: 'Chicken', quantity: 120, unit: 'g' }, { name: 'Broccoli', quantity: 80, unit: 'g' }] : [{ name: photoMode === 'package' ? 'Oat Daily cup' : 'Scanned food', quantity: 1, unit: 'portion', ...(photoMode === 'package' ? { brand: 'Gut Kitchen', ingredients: ['Oats', 'Milk', 'Sugar'], nutrition: { calories: 220, protein: 8, carbs: 32, fat: 6, fiber: 4, sugar: 9 } } : { nutrition: { calories: 220, protein: 8, carbs: 32, fat: 6, fiber: 4, sugar: 9 } }) }]); setStep(photoMode === 'food' ? 'items' : photoMode === 'package' ? 'package' : 'nutrition'); }} />
      <Button label={foodT('takeAnother')} variant="text" onPress={() => setStep('method')} />
    </View>}
    {step === 'package' && selectedItem && <View style={{ gap: theme.spacing.lg }}><Card style={{ gap: theme.spacing.xs, backgroundColor: theme.colors.entry.food.bg }}><AppText variant="sectionTitle">{foodLabel(selectedItem.name)}</AppText><AppText tone="secondary">{foodT('brand', { brand: selectedItem.brand ?? foodT('demo.gutKitchen') })}</AppText><AppText tone="secondary">{foodT('serving')}</AppText></Card><AppText variant="label">{foodT('readIngredientsQuestion')}</AppText><Button label={foodT('readIngredients')} onPress={() => setStep('ingredients')} /><Button label={foodT('skip')} variant="secondary" onPress={() => setStep('nutrition')} /></View>}
    {step === 'ingredients' && selectedItem && <View style={{ gap: theme.spacing.lg }}><Card><AppText variant="sectionTitle">{foodT('ingredients')}</AppText><View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>{(selectedItem.ingredients ?? ['Oats', 'Milk', 'Sugar']).map((ingredient) => <View key={ingredient} style={{ flexDirection: 'row', gap: theme.spacing.sm }}><AppText>•</AppText><AppText>{foodLabel(ingredient)}</AppText></View>)}</View></Card><Button label={foodT('continueNutrition')} onPress={() => setStep('nutrition')} /></View>}
    {step === 'nutrition' && selectedItem && <View style={{ gap: theme.spacing.lg }}><Card><AppText variant="sectionTitle">{foodT('nutritionPerServing')}</AppText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>{Object.entries(selectedItem.nutrition ?? { calories: 220, protein: 8, carbs: 32, fat: 6, fiber: 4, sugar: 9 }).map(([label, value]) => <View key={label} style={{ width: '30%', minWidth: 100, padding: theme.spacing.sm, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.subtle }}><AppText variant="caption" tone="secondary">{foodT(`nutritionFields.${label}`, { defaultValue: label })}</AppText><AppText variant="label">{value}{label === 'calories' ? ' kcal' : ' g'}</AppText></View>)}</View></Card><Button label={foodT('useProduct')} onPress={() => setStep('items')} /></View>}
    {step === 'items' && <View style={{ gap: theme.spacing.md }}>
      {method === 'voice' && <Card style={{ backgroundColor: theme.colors.entry.symptom.bg }}><AppText variant="label">{foodT('aiFound')}</AppText></Card>}
      {method === 'manual' && <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minHeight: theme.controls.minimumTouchTarget, paddingHorizontal: theme.spacing.md, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.control, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.card }}><Search size={theme.controls.icon} color={theme.colors.text.secondary} /><TextInput value={search} onChangeText={setSearch} placeholder={foodT('searchPlaceholder')} placeholderTextColor={theme.colors.text.secondary} style={{ flex: 1, ...theme.typography.body, color: theme.colors.text.primary }} /></View>}
      {!items.length && <View style={{ gap: theme.spacing.sm }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}><Search size={theme.controls.icon} color={theme.colors.text.secondary} /><AppText tone="secondary">{foodT('chooseBelow')}</AppText></View></View>}
      {items.map((item, index) => <Pressable key={`${item.name}-${index}`} onPress={() => { setSelected(index); setStep('edit'); }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minHeight: theme.controls.minimumTouchTarget, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, backgroundColor: pressed ? theme.colors.surface.subtle : theme.colors.surface.card })}><View style={{ flex: 1, gap: theme.spacing.xs }}><AppText variant="label">{foodLabel(item.name)}</AppText><AppText variant="caption" tone="secondary">{item.quantity} {unitLabel(item.unit)}</AppText></View><AppText variant="caption" tone="secondary">{method === 'photo-food' ? `${[98, 91, 76][index] ?? 84}%` : foodT('edit')}</AppText><ChevronRight size={theme.controls.smallIcon} color={theme.colors.text.secondary} /></Pressable>)}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{foods.filter((name) => !search || foodLabel(name).toLowerCase().includes(search.toLowerCase()) || name.toLowerCase().includes(search.toLowerCase())).slice(0, 8).map((name) => <Button key={name} label={`+ ${foodLabel(name)}`} variant="secondary" onPress={() => { add(name); setSearch(''); }} />)}</View>
      <Button label={foodT('continue')} icon={ChevronRight} onPress={() => setStep('meal')} disabled={!items.length} />
    </View>}
    {step === 'edit' && selectedItem && <View style={{ gap: theme.spacing.lg }}><Stepper value={selectedItem.quantity} min={1} max={9999} step={selectedItem.unit === 'g' ? 10 : 1} suffix={unitLabel(selectedItem.unit)} onChange={(quantity) => setItem({ quantity })} /><AppText variant="label">{foodT('unitTitle')}</AppText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{units.map((unit) => <View key={unit} style={{ minWidth: 100, flexGrow: 1 }}><Choice label={unitLabel(unit)} selected={selectedItem.unit === unit} onPress={() => setItem({ unit })} /></View>)}</View><Button label={foodT('done')} onPress={() => setStep('items')} /></View>}
    {step === 'meal' && <View style={{ gap: theme.spacing.lg }}><Card><AppText variant="label">{items.map((item) => foodLabel(item.name)).join(' + ')}</AppText><AppText tone="secondary">{foodT('items', { count: items.length })}</AppText></Card><AppText variant="label">{foodT('meal')}</AppText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{(['breakfast', 'lunch', 'dinner', 'snack', 'drink', 'other'] as const).map((value) => <View key={value} style={{ minWidth: 100, flexGrow: 1 }}><Choice label={foodT(`meals.${value}`)} selected={meal === value} onPress={() => setMeal(value)} /></View>)}</View></View>}
  </Screen>;
}
