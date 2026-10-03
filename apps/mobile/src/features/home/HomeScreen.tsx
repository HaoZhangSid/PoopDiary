import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Activity, ArrowRight, Bell, CircleDot, Dumbbell, Droplets, Leaf, Moon, Utensils, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Screen, useTheme } from '@/design-system';
import { localDateKey, type RecordKind } from '@/domain/records';
import { useAppStore } from '@/state/useAppStore';
import { RecordCard } from '@/features/diary';
import { displayDate } from '@/i18n/recordPresentation';
import { getGreetingKey, summarizeToday } from './model';

type QuickItem = { kind: RecordKind; label: string; icon: LucideIcon; tone: { bg: string; fg: string }; path?: string };

/** The Today surface mirrors the established Web prototype: brand, daily context,
 * horizontally scrollable quick logging, compact metrics, water, and the diary. */
export function HomeScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { t, i18n } = useTranslation(['home', 'common']);
  const records = useAppStore((state) => state.records);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer); }, []);
  const today = localDateKey(now);
  const summary = summarizeToday(records, today);
  const sleep = summary.sleepDurationMinutes;
  // The Web reference keeps three compact cards on the first row below 820px.
  // Only the narrow phone breakpoint lets the final two cards expand to half width.
  const narrowPhone = width <= 560;
  const tablet = width <= 820;
  const metrics: { kind: RecordKind; icon: LucideIcon; value: string; label: string; suffix: string; wide?: boolean }[] = [
    { kind: 'food', icon: Utensils, value: String(summary.counts.food), label: t('mealsLabel'), suffix: t('times') },
    { kind: 'bowel', icon: CircleDot, value: String(summary.counts.bowel), label: t('bowelLabel'), suffix: t('times') },
    { kind: 'symptom', icon: Activity, value: String(summary.counts.symptom), label: t('symptomLabel'), suffix: t('entry') },
    { kind: 'exercise', icon: Dumbbell, value: String(summary.counts.exercise), label: t('exerciseLabel'), suffix: t('times'), wide: true },
    { kind: 'sleep', icon: Moon, value: sleep === undefined ? '—' : `${Math.floor(sleep / 60)}h ${sleep % 60}m`, label: t('sleepLabel'), suffix: t('lastNight'), wide: true },
  ];
  const quickItems: QuickItem[] = [
    { kind: 'food', label: t('food', { ns: 'common' }), icon: Utensils, tone: theme.colors.entry.food },
    { kind: 'bowel', label: t('bowel', { ns: 'common' }), icon: CircleDot, tone: theme.colors.entry.bowel, path: '/bowel' },
    { kind: 'symptom', label: t('symptom', { ns: 'common' }), icon: Activity, tone: theme.colors.entry.symptom, path: '/symptom/index' },
    { kind: 'water', label: t('water', { ns: 'common' }), icon: Droplets, tone: theme.colors.entry.water, path: '/water/index' },
    { kind: 'exercise', label: t('exercise', { ns: 'common' }), icon: Dumbbell, tone: theme.colors.entry.exercise },
    { kind: 'sleep', label: t('sleep', { ns: 'common' }), icon: Moon, tone: theme.colors.entry.sleep },
  ];
  const openPath = (path?: string) => { if (path) router.push(path as never); };
  return <Screen>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: theme.spacing.md }}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('appName', { ns: 'common' })} onPress={() => router.replace('/')} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <View style={{ width: theme.controls.icon + theme.spacing.md, height: theme.controls.icon + theme.spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm, backgroundColor: theme.colors.action.primary.background }}><Leaf size={theme.controls.smallIcon} color={theme.colors.action.primary.foreground} /></View>
        <AppText variant="label" style={{ fontSize: theme.typography.sectionTitle.fontSize, lineHeight: theme.typography.sectionTitle.lineHeight }}>{t('appName', { ns: 'common' })}</AppText>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={{ width: theme.controls.minimumTouchTarget, height: theme.controls.minimumTouchTarget, alignItems: 'center', justifyContent: 'center' }}><Bell size={theme.controls.icon} color={theme.colors.text.secondary} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('profile', { ns: 'common' })} onPress={() => router.push('/profile')} style={{ width: theme.controls.minimumTouchTarget, height: theme.controls.minimumTouchTarget, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.pill, backgroundColor: theme.colors.feedback.success.bg }}><AppText variant="label" style={{ color: theme.colors.feedback.success.fg }}>ML</AppText></Pressable>
      </View>
    </View>

    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.md, marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
      <View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
        <AppText variant="label" style={{ letterSpacing: theme.typography.sectionTitle.letterSpacing }}>{displayDate(today, i18n.language, true)}</AppText>
        <AppText variant="heroTitle">{t(`greetings.${getGreetingKey(now.getHours())}`)}</AppText>
        <AppText variant="body" tone="secondary">{summary.entries.length ? t('entryCount', { count: summary.entries.length }) : t('empty')}</AppText>
      </View>
      <Card style={{ width: narrowPhone ? 112 : 128, minHeight: theme.controls.minimumTouchTarget * 2 + theme.spacing.md, justifyContent: 'space-between', padding: theme.spacing.md, borderRadius: theme.radius.lg }}>
        <AppText variant="caption" tone="secondary">{t('streak')}</AppText>
        <AppText variant="sectionTitle" style={{ color: theme.colors.feedback.danger.fg }}>{summary.streak} <AppText variant="caption" tone="secondary">{t('days')}</AppText></AppText>
      </Card>
    </View>

    <View style={{ gap: theme.spacing.sm }}>
      <AppText variant="homeSectionTitle" accessibilityRole="header">{t('quickTitle')}</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm, paddingRight: theme.spacing.md }}>
        {quickItems.map((item) => <QuickLogCard key={item.kind} item={item} onPress={() => openPath(item.path)} />)}
      </ScrollView>
    </View>

    <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
      <AppText variant="homeSectionTitle" accessibilityRole="header">{t('overview')}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        {metrics.map((metric) => <MetricCard key={metric.kind} {...metric} layout={tablet ? (narrowPhone ? 'phone' : 'tablet') : 'desktop'} onPress={() => openPath(quickItems.find((item) => item.kind === metric.kind)?.path)} />)}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('water', { ns: 'common' })} onPress={() => openPath('/water/index')} style={({ pressed }) => ({ minHeight: theme.controls.minimumTouchTarget * 1.45, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.md, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, borderRadius: theme.radius.lg, backgroundColor: pressed ? theme.colors.surface.subtle : theme.colors.surface.card })}>
        <View style={{ width: theme.controls.icon + theme.spacing.md, height: theme.controls.icon + theme.spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm, backgroundColor: theme.colors.entry.water.bg }}><Droplets size={theme.controls.icon} color={theme.colors.entry.water.fg} /></View>
        <View style={{ width: theme.controls.minimumTouchTarget * 2.1, gap: theme.spacing.xs }}><AppText variant="label">{t('water', { ns: 'common' })}</AppText><AppText variant="caption" tone="secondary">{summary.waterMl} {t('waterGoal')}</AppText></View>
        <View style={{ flex: 1, height: theme.spacing.sm, overflow: 'hidden', borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface.subtle }}><View style={{ width: `${Math.min(100, summary.waterMl / 20)}%`, height: '100%', backgroundColor: theme.colors.entry.water.fg }} /></View>
        <ArrowRight size={theme.controls.smallIcon} color={theme.colors.text.secondary} />
      </Pressable>
    </View>

    <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        <AppText variant="label" style={{ letterSpacing: theme.typography.sectionTitle.letterSpacing }}>{t('recent')} · {summary.entries.length} {t('entry')}</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel={t('allEntries')} onPress={() => router.push('/diary')} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingVertical: theme.spacing.xs }}><AppText variant="label">{t('allEntries')}</AppText><ArrowRight size={theme.controls.smallIcon} color={theme.colors.text.primary} /></Pressable>
      </View>
      <AppText variant="homeSectionTitle" accessibilityRole="header">{t('recent')}</AppText>
      {!summary.entries.length ? <View style={{ alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xl }}>
        <View style={{ width: theme.controls.icon + theme.spacing.lg, height: theme.controls.icon + theme.spacing.lg, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface.subtle }}><Leaf size={theme.controls.icon} color={theme.colors.text.primary} /></View>
        <AppText variant="label" tone="secondary">{t('empty')}</AppText>
        <Button label={t('addFirst')} onPress={() => router.push('/bowel')} />
      </View> : summary.entries.slice(0, 6).map((record) => <RecordCard layout="timeline" key={record.id} record={record} onPress={() => router.push({ pathname: '/diary', params: { entry: record.id } })} />)}
    </View>
  </Screen>;
}

function QuickLogCard({ item, onPress }: { item: QuickItem; onPress: () => void }) {
  const theme = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={item.label} onPress={onPress} style={({ pressed }) => ({ width: 148, minHeight: theme.controls.minimumTouchTarget * 1.65, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.sm, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, borderRadius: theme.radius.lg, backgroundColor: pressed ? item.tone.bg : theme.colors.surface.card })}>
    <View style={{ width: theme.controls.icon + theme.spacing.md, height: theme.controls.icon + theme.spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm, backgroundColor: item.tone.bg }}><item.icon size={theme.controls.icon} color={item.tone.fg} /></View>
    <AppText variant="label" style={{ flex: 1 }} numberOfLines={1}>{item.label}</AppText>
    <ArrowRight size={theme.controls.smallIcon} color={theme.colors.text.secondary} />
  </Pressable>;
}

function MetricCard({ kind, icon: Icon, value, label, suffix, wide, layout, onPress }: { kind: RecordKind; icon: LucideIcon; value: string; label: string; suffix: string; wide?: boolean; layout: 'desktop' | 'tablet' | 'phone'; onPress: () => void }) {
  const theme = useTheme();
  const tone = theme.colors.entry[kind];
  const compactPhone = layout === 'phone';
  const tabletCard = layout === 'tablet';
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({
    flexGrow: compactPhone && wide ? 1 : 0,
    flexBasis: layout === 'desktop' ? '18%' : compactPhone && wide ? '45%' : '30%',
    minWidth: layout === 'desktop' ? 100 : 0,
    minHeight: theme.controls.minimumTouchTarget * 2.25,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderWidth: theme.controls.borderWidth,
    borderColor: theme.colors.border.default,
    borderRadius: tabletCard ? theme.radius.md : theme.radius.lg,
    backgroundColor: pressed ? theme.colors.surface.subtle : theme.colors.surface.card,
  })}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}><Icon size={theme.controls.smallIcon} color={tone.fg} /><AppText variant="caption" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>{label}</AppText><ArrowRight size={theme.spacing.sm} color={theme.colors.text.secondary} /></View>
    <AppText variant="sectionTitle">{value}<AppText variant="caption" tone="secondary"> {suffix}</AppText></AppText>
    <View style={{ height: theme.controls.borderWidth + theme.spacing.xs / 2, borderRadius: theme.radius.pill, backgroundColor: tone.fg }} />
  </Pressable>;
}
