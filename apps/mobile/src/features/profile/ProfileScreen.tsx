import { useState, type ReactNode } from 'react';
import { Pressable, TextInput, View, useWindowDimensions } from 'react-native';
import { Activity, BarChart3, Bell, ChevronRight, Edit3, FileText, MoreHorizontal, Moon, ShieldCheck, Sparkles, Trash2, Utensils, Waves } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Screen, useTheme } from '@/design-system';
import { useAppStore } from '@/state/useAppStore';

type Kind = 'food' | 'bowel' | 'symptom' | 'water' | 'exercise' | 'sleep';

/** Web profile layout reproduced for Expo and kept responsive for phones. */
export function ProfileScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const desktop = width > 820;
  const { t } = useTranslation('profile');
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('Mira Laitinen');
  const [tracking, setTracking] = useState<Record<Kind, boolean>>({ food: true, bowel: true, symptom: true, water: true, exercise: true, sleep: true });
  const [aiInsights, setAiInsights] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const change = async (patch: Parameters<typeof updateSettings>[0]) => {
    if (busy) return;
    setBusy(true);
    try { await updateSettings(patch); } finally { setBusy(false); }
  };
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const kinds: { key: Kind; icon: typeof Utensils; label: string; color: { bg: string; fg: string } }[] = [
    { key: 'food', icon: Utensils, label: t('food'), color: theme.colors.entry.food },
    { key: 'bowel', icon: Activity, label: t('bowel'), color: theme.colors.entry.bowel },
    { key: 'symptom', icon: Activity, label: t('symptoms'), color: theme.colors.entry.symptom },
    { key: 'water', icon: Waves, label: t('water'), color: theme.colors.entry.water },
    { key: 'exercise', icon: Activity, label: t('exercise'), color: theme.colors.entry.exercise },
    { key: 'sleep', icon: Moon, label: t('sleep'), color: theme.colors.entry.sleep },
  ];
  return <Screen topbar>
    <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.xxl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="webPageTitle" accessibilityRole="header">{t('title')}</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel={t('more')} style={{ width: 38, height: 38, borderRadius: theme.radius.md, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, backgroundColor: theme.colors.surface.card, alignItems: 'center', justifyContent: 'center' }} onPress={() => setEditing(true)}><MoreHorizontal size={19} color={theme.colors.text.secondary} /></Pressable>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingBottom: theme.spacing.lg, borderBottomWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default }}>
        <View style={{ width: 65, height: 65, borderRadius: theme.radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.feedback.success.bg }}><AppText variant="sectionTitle" style={{ color: theme.colors.feedback.success.fg }}>{initials}</AppText></View>
        <View style={{ gap: theme.spacing.xs / 2, alignItems: 'flex-start' }}>
          {editing ? <TextInput value={name} onChangeText={setName} autoFocus accessibilityLabel={t('name')} style={{ ...theme.typography.sectionTitle, minWidth: 180, paddingVertical: 0, color: theme.colors.text.primary, borderBottomWidth: theme.controls.borderWidth, borderColor: theme.colors.border.control }} /> : <AppText variant="sectionTitle">{name}</AppText>}
          <AppText variant="caption" tone="secondary">mira@example.com</AppText>
          <Pressable accessibilityRole="button" onPress={() => setEditing((value) => !value)} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.xs }}><Edit3 size={14} color={theme.colors.text.primary} /><AppText variant="label">{editing ? t('saveProfile') : t('editProfile')}</AppText></Pressable>
        </View>
      </View>
      <View style={{ flexDirection: desktop ? 'row' : 'column', gap: desktop ? theme.spacing.xl + theme.spacing.xs + theme.spacing.xs / 2 : theme.spacing.xl, alignItems: 'stretch' }}>
        <View style={{ flex: 1, gap: theme.spacing.xl }}>
          <SettingsSection title={t('tracking')}>
            {kinds.map(({ key, icon: Icon, label, color }) => <SettingRow key={key} icon={Icon} iconColor={color.fg} iconBg={color.bg} label={label} value={tracking[key]} onPress={() => setTracking((current) => ({ ...current, [key]: !current[key] }))} />)}
          </SettingsSection>
          <SettingsSection title={t('aiAnalysis')}><SettingRow icon={Sparkles} iconColor={theme.colors.feedback.success.fg} iconBg={theme.colors.feedback.success.bg} label={t('aiInsights')} value={aiInsights} onPress={() => setAiInsights((value) => !value)} /></SettingsSection>
        </View>
        <View style={{ flex: 1, gap: theme.spacing.xl }}>
          <SettingsSection title={t('reminders')}>
            <SettingRow icon={Bell} iconColor={theme.colors.feedback.warning.fg} iconBg={theme.colors.feedback.warning.bg} label={t('dailyReminder')} detail={t('dailyTime')} value={dailyReminder} onPress={() => setDailyReminder((value) => !value)} />
            <SettingRow icon={BarChart3} iconColor={theme.colors.entry.water.fg} iconBg={theme.colors.entry.water.bg} label={t('weeklyReport')} detail={t('weeklyDay')} value={weeklyReport} onPress={() => setWeeklyReport((value) => !value)} />
          </SettingsSection>
          <SettingsSection title={t('privacy')}>
            <ActionRow icon={FileText} label={t('export')} onPress={() => undefined} /><ActionRow icon={ShieldCheck} label={t('aiData')} onPress={() => undefined} /><ActionRow icon={Trash2} label={t('deleteData')} danger onPress={() => undefined} />
          </SettingsSection>
          <SettingsSection title={t('appearance')}><OptionGroup values={['light', 'dark', 'system']} selected={settings.appearance} onSelect={(appearance) => { void change({ appearance }); }} labels={{ light: t('light'), dark: t('dark'), system: t('system') }} /></SettingsSection>
          <SettingsSection title={t('language')}><OptionGroup values={['en', 'fi', 'zh']} selected={settings.language} onSelect={(language) => { void change({ language }); }} labels={{ en: 'English', fi: 'Suomi', zh: '中文' }} /></SettingsSection>
        </View>
      </View>
      <Button variant="secondary" label={t('components')} onPress={() => router.push('/components')} />
    </View>
  </Screen>;
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) { const theme = useTheme(); return <View><AppText variant="sectionTitle" style={{ fontSize: theme.typography.sectionTitle.fontSize - theme.spacing.xs / 2, letterSpacing: 0, marginBottom: theme.spacing.sm }}>{title}</AppText><View style={{ borderTopWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default }}>{children}</View></View>; }
function SettingRow({ icon: Icon, iconColor, iconBg, label, detail, value, onPress }: { icon: typeof Bell; iconColor: string; iconBg: string; label: string; detail?: string; value: boolean; onPress: () => void }) { const theme = useTheme(); return <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={onPress} style={({ pressed }) => ({ minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.sm, borderBottomWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, opacity: pressed ? 0.7 : 1 })}><View style={{ width: 33, height: 33, borderRadius: theme.radius.sm, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={iconColor} /></View><View style={{ flex: 1, gap: theme.spacing.xs / 2 }}><AppText variant="label">{label}</AppText>{detail && <AppText variant="caption" tone="secondary" style={{ fontSize: theme.typography.caption.fontSize - theme.controls.borderWidth * 3 }}>{detail}</AppText>}</View><Toggle value={value} /></Pressable>; }
function ActionRow({ icon: Icon, label, danger, onPress }: { icon: typeof FileText; label: string; danger?: boolean; onPress: () => void }) { const theme = useTheme(); return <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, borderBottomWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default }}><Icon size={17} color={danger ? theme.colors.feedback.danger.fg : theme.colors.text.primary} /><AppText variant="body" style={{ flex: 1, fontSize: theme.typography.label.fontSize - theme.controls.borderWidth, color: danger ? theme.colors.feedback.danger.fg : theme.colors.text.primary }}>{label}</AppText><ChevronRight size={16} color={theme.colors.text.secondary} /></Pressable>; }
function Toggle({ value }: { value: boolean }) { const theme = useTheme(); return <View style={{ width: 44, height: 28, padding: theme.spacing.xs - theme.controls.borderWidth, borderRadius: theme.radius.pill, backgroundColor: value ? theme.colors.feedback.success.fg : theme.colors.surface.subtle, alignItems: value ? 'flex-end' : 'flex-start', justifyContent: 'center' }}><View style={{ width: 22, height: 22, borderRadius: theme.radius.md, backgroundColor: value ? theme.colors.surface.card : theme.colors.text.secondary }} /></View>; }
function OptionGroup<T extends string>({ values, selected, onSelect, labels }: { values: T[]; selected: T; onSelect: (value: T) => void; labels: Record<T, string> }) { const theme = useTheme(); return <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>{values.map((value) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ selected: selected === value }} onPress={() => onSelect(value)} style={{ flex: 1, minHeight: 42, paddingHorizontal: theme.spacing.sm, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm, borderWidth: theme.controls.borderWidth, borderColor: selected === value ? theme.colors.feedback.success.fg : theme.colors.border.default, backgroundColor: selected === value ? theme.colors.feedback.success.bg : theme.colors.surface.card }}><AppText variant="label" style={{ color: selected === value ? theme.colors.feedback.success.fg : theme.colors.text.secondary }}>{labels[value]}</AppText></Pressable>)}</View>; }
