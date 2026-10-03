import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Activity, ArrowRight, CircleDot, Dumbbell, Droplets, Leaf, Moon, Settings2, Utensils, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, IconButton, Screen, useTheme } from '@/design-system';
import { localDateKey, type RecordKind } from '@/domain/records';
import { useAppStore } from '@/state/useAppStore';
import { RecordCard } from '@/features/diary';
import { displayDate } from '@/i18n/recordPresentation';
import { getGreetingKey, summarizeToday } from './model';

/** Port the existing Web Home structure; summaries read the native record cache. */
export function HomeScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation(['home', 'common']);
  const records = useAppStore((state) => state.records);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer); }, []);
  const today = localDateKey(now);
  const summary = summarizeToday(records, today);
  const sleep = summary.sleepDurationMinutes;
  const metrics: { kind: RecordKind; icon: LucideIcon; value: string }[] = [
    { kind: 'food', icon: Utensils, value: String(summary.counts.food) },
    { kind: 'bowel', icon: CircleDot, value: String(summary.counts.bowel) },
    { kind: 'symptom', icon: Activity, value: String(summary.counts.symptom) },
    { kind: 'exercise', icon: Dumbbell, value: String(summary.counts.exercise) },
    { kind: 'sleep', icon: Moon, value: sleep === undefined ? '—' : `${Math.floor(sleep / 60)}h ${sleep % 60}m` },
  ];
  return <Screen>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, borderBottomWidth: theme.controls.borderWidth, borderBottomColor: theme.colors.border.default, paddingBottom: theme.spacing.md }}>
      <View style={{ padding: theme.spacing.sm, borderRadius: theme.radius.md, backgroundColor: theme.colors.entry.food.bg }}><Leaf size={theme.controls.icon} color={theme.colors.entry.food.fg} /></View>
      <AppText variant="label" style={{ flex: 1 }}>{t('appName', { ns: 'common' })}</AppText>
      <IconButton label={t('profile', { ns: 'common' })} icon={Settings2} onPress={() => router.push('/profile')} />
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.sm }}>
      <View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
        <AppText variant="caption" tone="secondary">{displayDate(today, i18n.language, true)}</AppText>
        <AppText variant="pageTitle" accessibilityRole="header">{t(`greetings.${getGreetingKey(now.getHours())}`)}</AppText>
        <AppText variant="caption" tone="secondary">{summary.entries.length ? t('entryCount', { count: summary.entries.length }) : t('empty')}</AppText>
      </View>
      <Card style={{ padding: theme.spacing.sm, gap: theme.spacing.xs }}>
        <AppText variant="caption" tone="secondary">{t('streak')}</AppText>
        <AppText variant="sectionTitle" style={{ color: theme.colors.entry.symptom.fg }}>{summary.streak} <AppText variant="caption" tone="secondary">{t('days')}</AppText></AppText>
      </Card>
    </View>
    <View style={{ gap: theme.spacing.sm }}>
      <AppText variant="sectionTitle" accessibilityRole="header">{t('quickTitle')}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        <QuickLogButton label={t('bowel', { ns: 'common' })} icon={CircleDot} tone={theme.colors.entry.bowel} onPress={() => router.push('/bowel')} />
        <QuickLogButton label={t('water', { ns: 'common' })} icon={Droplets} tone={theme.colors.entry.water} onPress={() => router.push('/water/index')} />
        <QuickLogButton label={t('symptom', { ns: 'common' })} icon={Activity} tone={theme.colors.entry.symptom} onPress={() => router.push('/symptom/index')} />
      </View>
    </View>
    <View style={{ gap: theme.spacing.sm, paddingTop: theme.spacing.sm }}>
      <AppText variant="sectionTitle" accessibilityRole="header">{t('overview')}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        {metrics.map(({ kind, value, icon: MetricIcon }) => <Card key={kind} style={{ flexBasis: '28%', flexGrow: 1, minWidth: theme.controls.minimumTouchTarget * 2, minHeight: theme.controls.minimumTouchTarget * 2, gap: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <MetricIcon size={theme.controls.smallIcon} color={theme.colors.entry[kind].fg} />
            <AppText variant="caption" tone="secondary" style={{ flex: 1 }}>{t(kind, { ns: 'common' })}</AppText>
          </View>
          <AppText variant="sectionTitle">{value}</AppText>
          <View style={{ height: theme.controls.borderWidth, backgroundColor: theme.colors.entry[kind].fg }} />
        </Card>)}
      </View>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Droplets size={theme.controls.icon} color={theme.colors.entry.water.fg} />
        <View style={{ gap: theme.spacing.xs }}><AppText variant="label">{t('water', { ns: 'common' })}</AppText><AppText variant="caption" tone="secondary">{summary.waterMl} / 2000 ml</AppText></View>
        <View style={{ flex: 1, height: theme.spacing.sm, backgroundColor: theme.colors.entry.water.bg, borderRadius: theme.radius.pill, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${Math.min(100, summary.waterMl / 20)}%`, backgroundColor: theme.colors.entry.water.fg }} />
        </View>
      </Card>
    </View>
    <View style={{ gap: theme.spacing.sm, paddingTop: theme.spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        <AppText variant="sectionTitle" accessibilityRole="header" style={{ flex: 1 }}>{t('recent')}</AppText>
        <IconButton label={t('allEntries')} icon={ArrowRight} onPress={() => router.push('/diary')} />
      </View>
      {!summary.entries.length ? <View style={{ alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xl }}>
        <View style={{ padding: theme.spacing.md, backgroundColor: theme.colors.entry.food.bg, borderRadius: theme.radius.pill }}><Leaf size={theme.controls.icon} color={theme.colors.entry.food.fg} /></View>
        <AppText variant="label" tone="secondary">{t('empty')}</AppText>
        <Button label={t('addFirst')} onPress={() => router.push('/bowel')} />
      </View> : summary.entries.slice(0, 6).map((record) => <RecordCard layout="timeline" key={record.id} record={record} onPress={() => router.push({ pathname: '/diary', params: { entry: record.id } })} />)}
    </View>
  </Screen>;
}

function QuickLogButton({ label, icon: Icon, tone, onPress }: { label: string; icon: LucideIcon; tone: { bg: string; fg: string }; onPress: () => void }) {
  const theme = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({ pressed }) => ({ flex: 1, minWidth: theme.controls.minimumTouchTarget * 4, minHeight: theme.controls.minimumTouchTarget, padding: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, backgroundColor: pressed ? tone.bg : theme.colors.surface.card, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.control, borderRadius: theme.radius.md })}>
    <View style={{ padding: theme.spacing.sm, borderRadius: theme.radius.sm, backgroundColor: tone.bg }}><Icon size={theme.controls.icon} color={tone.fg} /></View>
    <AppText variant="label" style={{ flex: 1 }}>{label}</AppText>
    <ArrowRight size={theme.controls.smallIcon} color={theme.colors.text.secondary} />
  </Pressable>;
}
