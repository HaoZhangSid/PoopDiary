import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Activity, ArrowRight, CircleDot, Dumbbell, Droplets, Leaf, Moon, Utensils, type LucideIcon } from 'lucide-react-native';
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
  const [metricContainerWidth, setMetricContainerWidth] = useState(0);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer); }, []);
  const today = localDateKey(now);
  const summary = summarizeToday(records, today);
  const sleep = summary.sleepDurationMinutes;
  // Keep the compact 3 + 2 overview rhythm used by the Web reference on phones.
  const narrowPhone = width <= 560;
  const tablet = width <= 820;
  const desktop = width > 820;
  const metrics: { kind: RecordKind; icon: LucideIcon; value: string; label: string; suffix: string }[] = [
    { kind: 'food', icon: Utensils, value: String(summary.counts.food), label: t('mealsLabel'), suffix: t('times') },
    { kind: 'bowel', icon: CircleDot, value: String(summary.counts.bowel), label: t('bowelLabel'), suffix: t('times') },
    { kind: 'symptom', icon: Activity, value: String(summary.counts.symptom), label: t('symptomLabel'), suffix: t('entry') },
    { kind: 'exercise', icon: Dumbbell, value: String(summary.counts.exercise), label: t('exerciseLabel'), suffix: t('times') },
    { kind: 'sleep', icon: Moon, value: sleep === undefined ? '—' : `${Math.floor(sleep / 60)}h ${sleep % 60}m`, label: t('sleepLabel'), suffix: t('lastNight') },
  ];
  const quickItems: QuickItem[] = [
    { kind: 'food', label: t('food', { ns: 'common' }), icon: Utensils, tone: theme.colors.entry.food, path: '/food?quick=1' },
    { kind: 'bowel', label: t('bowel', { ns: 'common' }), icon: CircleDot, tone: theme.colors.entry.bowel, path: '/bowel?quick=1' },
    { kind: 'symptom', label: t('symptom', { ns: 'common' }), icon: Activity, tone: theme.colors.entry.symptom, path: '/symptom?quick=1' },
    { kind: 'water', label: t('water', { ns: 'common' }), icon: Droplets, tone: theme.colors.entry.water, path: '/water?quick=1' },
    { kind: 'exercise', label: t('exercise', { ns: 'common' }), icon: Dumbbell, tone: theme.colors.entry.exercise, path: '/exercise?quick=1' },
    { kind: 'sleep', label: t('sleep', { ns: 'common' }), icon: Moon, tone: theme.colors.entry.sleep, path: '/sleep?quick=1' },
  ];
  const openPath = (path?: string) => { if (path) router.push(path as never); };
  // Screen applies the same horizontal padding to every section. Use the
  // deterministic viewport fallback on the first frame, then replace it with
  // the measured grid width once the layout is known. This prevents a visible
  // 31% flex-basis flash that leaves the metric row narrower than the water card.
  const metricWidthSource = metricContainerWidth > 0
    ? metricContainerWidth
    : Math.max(0, Math.min(width, theme.controls.contentWidth) - theme.spacing.md * 2);
  const compactMetricWidth = (metricWidthSource - theme.controls.compactMetricGap * 2) / 3;
  const desktopMetricWidth = (metricWidthSource - theme.controls.compactMetricGap * 4) / 5;
  return <Screen>

    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.md, marginTop: desktop ? theme.spacing.xs : theme.spacing.md, marginBottom: desktop ? theme.spacing.sm + theme.controls.borderWidth * 2 : theme.spacing.md }}>
      <View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
        <AppText variant="label" style={{ letterSpacing: theme.typography.sectionTitle.letterSpacing }}>{displayDate(today, i18n.language, true)}</AppText>
        <AppText variant="heroTitle">{t(`greetings.${getGreetingKey(now.getHours())}`)}, Mira</AppText>
        <AppText variant="body" tone="secondary">{summary.entries.length ? t('entryCount', { count: summary.entries.length }) : t('empty')}</AppText>
      </View>
      <Card style={{ width: narrowPhone ? 112 : 128, minHeight: theme.controls.minimumTouchTarget * 2 + theme.spacing.md, justifyContent: 'space-between', padding: theme.spacing.md, borderRadius: theme.radius.lg }}>
        <AppText variant="caption" tone="secondary">{t('streak')}</AppText>
        <AppText variant="sectionTitle" style={{ color: theme.colors.feedback.danger.fg }}>{summary.streak} <AppText variant="caption" tone="secondary">{t('days')}</AppText></AppText>
      </Card>
    </View>

    <View style={{ gap: theme.controls.quickLogSectionGap }}>
      <AppText variant="homeSectionTitle" accessibilityRole="header">{t('quickTitle')}</AppText>
      {desktop
        ? <View style={{ width: '100%', alignSelf: 'stretch', flexDirection: 'row', gap: theme.spacing.sm }}>{quickItems.map((item) => <QuickLogCard key={item.kind} item={item} onPress={() => openPath(item.path)} expanded />)}</View>
        : <ScrollView horizontal style={{ width: '100%', alignSelf: 'stretch' }} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm, paddingRight: theme.spacing.md }}>{quickItems.map((item) => <QuickLogCard key={item.kind} item={item} onPress={() => openPath(item.path)} />)}</ScrollView>}
    </View>

    <View style={{ marginTop: desktop ? theme.controls.overviewSectionMarginTop + theme.spacing.xs : theme.controls.overviewSectionMarginTop }}>
      <AppText variant="homeSectionTitle" accessibilityRole="header">{t('overview')}</AppText>
      <View
        onLayout={(event) => {
          const nextWidth = event.nativeEvent.layout.width;
          setMetricContainerWidth((currentWidth) => Math.abs(currentWidth - nextWidth) > 0.5 ? nextWidth : currentWidth);
        }}
        style={{ width: '100%', alignSelf: 'stretch', flexDirection: 'row', flexWrap: 'wrap', gap: theme.controls.compactMetricGap, marginTop: desktop ? theme.controls.overviewSectionGap - theme.spacing.xs - theme.controls.borderWidth : theme.controls.overviewSectionGap }}
      >
        {metrics.map((metric) => <MetricCard key={metric.kind} {...metric} layout={tablet ? (narrowPhone ? 'phone' : 'tablet') : 'desktop'} cardWidth={desktop ? desktopMetricWidth : compactMetricWidth} onPress={() => openPath(quickItems.find((item) => item.kind === metric.kind)?.path)} />)}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('water', { ns: 'common' })} onPress={() => openPath('/water')} style={({ pressed }) => ({ width: '100%', alignSelf: 'stretch', minHeight: theme.controls.minimumTouchTarget * 1.3, marginTop: theme.controls.overviewMetricToWaterGap, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.md, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, borderRadius: theme.radius.lg, backgroundColor: pressed ? theme.colors.surface.subtle : theme.colors.surface.card })}>
        <View style={{ width: theme.controls.icon + theme.spacing.md, height: theme.controls.icon + theme.spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm, backgroundColor: theme.colors.entry.water.bg }}><Droplets size={theme.controls.icon} color={theme.colors.entry.water.fg} /></View>
        <View style={{ width: theme.controls.minimumTouchTarget * 2.1, gap: theme.spacing.xs }}><AppText variant="label">{t('water', { ns: 'common' })}</AppText><AppText variant="caption" tone="secondary">{summary.waterMl} {t('waterGoal')}</AppText></View>
        <View style={{ flex: 1, height: theme.spacing.sm, overflow: 'hidden', borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface.subtle }}><View style={{ width: `${Math.min(100, summary.waterMl / 20)}%`, height: '100%', backgroundColor: theme.colors.entry.water.fg }} /></View>
        <ArrowRight size={theme.controls.smallIcon} color={theme.colors.text.secondary} />
      </Pressable>
    </View>

    <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg - theme.spacing.xs + theme.controls.borderWidth }}>
      <View style={{ minHeight: theme.spacing.xxl + theme.spacing.sm + theme.spacing.xs, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        <View style={{ paddingTop: theme.spacing.sm, minWidth: 0 }}><AppText variant="eyebrow">{t('recent')} · {summary.entries.length} {t('entry')}</AppText><AppText variant="homeSectionTitle" style={{ marginTop: theme.spacing.xs }}>{t('recent')}</AppText></View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('allEntries')} onPress={() => router.push('/diary')} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingVertical: theme.spacing.xs }}><AppText variant="label">{t('allEntries')}</AppText><ArrowRight size={theme.controls.smallIcon} color={theme.colors.text.primary} /></Pressable>
      </View>
      {!summary.entries.length ? <View style={{ alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xl }}>
        <View style={{ width: theme.controls.icon + theme.spacing.lg, height: theme.controls.icon + theme.spacing.lg, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface.subtle }}><Leaf size={theme.controls.icon} color={theme.colors.text.primary} /></View>
        <AppText variant="label" tone="secondary">{t('empty')}</AppText>
        <Button label={t('addFirst')} onPress={() => router.push('/bowel')} />
      </View> : summary.entries.slice(0, 6).map((record) => <RecordCard layout="timeline" key={record.id} record={record} onPress={() => router.push({ pathname: '/diary', params: { entry: record.id } })} />)}
    </View>
  </Screen>;
}

function QuickLogCard({ item, onPress, expanded = false }: { item: QuickItem; onPress: () => void; expanded?: boolean }) {
  const theme = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={item.label} onPress={onPress} style={({ pressed }) => ({ width: expanded ? undefined : theme.controls.quickLogCardWidth, flex: expanded ? 1 : undefined, minWidth: 0, minHeight: theme.controls.quickLogCardHeight, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, padding: theme.controls.quickLogCardPadding, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, borderRadius: theme.radius.md, backgroundColor: pressed ? item.tone.bg : theme.colors.surface.card })}>
    <View style={{ width: theme.controls.quickLogIconSize, height: theme.controls.quickLogIconSize, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.md, backgroundColor: item.tone.bg }}><item.icon size={theme.controls.quickLogIconGlyph} color={item.tone.fg} /></View>
    <AppText variant="label" style={{ flex: 1 }} numberOfLines={1}>{item.label}</AppText>
    <ArrowRight size={theme.controls.smallIcon} color={theme.colors.text.secondary} />
  </Pressable>;
}

function MetricCard({ kind, icon: Icon, value, label, suffix, layout, cardWidth, onPress }: { kind: RecordKind; icon: LucideIcon; value: string; label: string; suffix: string; layout: 'desktop' | 'tablet' | 'phone'; cardWidth?: number; onPress: () => void }) {
  const theme = useTheme();
  const tone = theme.colors.entry[kind];
  const metricLine = kind === 'food' ? theme.colors.feedback.success.fg : tone.fg;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({
    flexGrow: 0,
    width: cardWidth,
    flexBasis: cardWidth,
    minWidth: 0,
    minHeight: layout === 'desktop' ? theme.controls.minimumTouchTarget * 2 + theme.spacing.sm : theme.controls.compactMetricHeight,
    gap: layout === 'desktop' ? theme.spacing.sm : theme.spacing.xs,
    paddingVertical: layout === 'desktop' ? theme.spacing.sm : theme.controls.compactMetricVerticalPadding,
    paddingHorizontal: layout === 'desktop' ? theme.spacing.sm : theme.controls.compactMetricPadding,
    borderWidth: theme.controls.borderWidth,
    borderColor: theme.colors.border.default,
    borderRadius: layout === 'desktop' ? theme.radius.lg : theme.radius.md,
    backgroundColor: pressed ? theme.colors.surface.subtle : theme.colors.surface.card,
  })}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}><Icon size={theme.controls.smallIcon} color={tone.fg} /><AppText variant="caption" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>{label}</AppText><ArrowRight size={theme.spacing.sm} color={theme.colors.text.secondary} /></View>
    <AppText variant="sectionTitle">{value}<AppText variant="caption" tone="secondary"> {suffix}</AppText></AppText>
    <View style={{ height: theme.controls.borderWidth + theme.spacing.xs / 2, borderRadius: theme.radius.pill, backgroundColor: metricLine }} />
  </Pressable>;
}
