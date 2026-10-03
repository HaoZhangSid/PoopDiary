import { Pressable, View } from 'react-native';
import { CircleDot, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { DiaryRecord } from '@/domain/records';
import { AppText, useTheme } from '@/design-system';
import { displayTime, recordSummary, recordTitle } from '@/i18n/recordPresentation';

export function RecordCard({ record, onPress, layout = 'card' }: { record: DiaryRecord; onPress: () => void; layout?: 'card' | 'timeline' }) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const pair = theme.colors.entry[record.kind];
  const time = displayTime(record, i18n.language);
  if (layout === 'timeline') return <Pressable accessibilityRole="button" accessibilityLabel={`${recordTitle(record)}, ${time}, ${recordSummary(record)}`} onPress={onPress}
    style={({ pressed }) => ({ minHeight: theme.controls.minimumTouchTarget, backgroundColor: pressed ? theme.colors.surface.subtle : theme.colors.surface.canvas, borderBottomWidth: theme.controls.borderWidth, borderBottomColor: theme.colors.border.default, paddingVertical: theme.spacing.md, gap: theme.spacing.sm, flexDirection: 'row', alignItems: 'center' })}>
    <AppText variant="caption" tone="secondary" style={{ width: theme.controls.minimumTouchTarget }}>{time}</AppText>
    <View style={{ padding: theme.spacing.sm, borderRadius: theme.radius.sm, backgroundColor: pair.bg }}><CircleDot size={theme.controls.smallIcon} color={pair.fg} /></View>
    <View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
      <AppText variant="label">{recordTitle(record)}</AppText>
      {Boolean(recordSummary(record)) && <AppText variant="caption" tone="secondary">{recordSummary(record)}</AppText>}
    </View>
    <ChevronRight size={theme.controls.smallIcon} color={theme.colors.text.secondary} />
  </Pressable>;
  return <Pressable accessibilityRole="button" accessibilityLabel={`${recordTitle(record)}, ${displayTime(record, i18n.language)}, ${recordSummary(record)}`} onPress={onPress}
    style={({ pressed }) => ({ minHeight: theme.controls.minimumTouchTarget, backgroundColor: pressed ? theme.colors.surface.subtle : theme.colors.surface.card, borderWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, borderRadius: theme.radius.lg, padding: theme.spacing.md, gap: theme.spacing.md, flexDirection: 'row', alignItems: 'center' })}>
    <View style={{ padding: theme.spacing.sm, borderRadius: theme.radius.md, backgroundColor: pair.bg }}><CircleDot size={theme.controls.icon} color={pair.fg} /></View>
    <View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
      <AppText variant="label">{recordTitle(record)}</AppText>
      {Boolean(recordSummary(record)) && <AppText tone="secondary">{recordSummary(record)}</AppText>}
      <AppText variant="caption" tone="secondary">{displayTime(record, i18n.language)}</AppText>
    </View>
    <ChevronRight size={theme.controls.icon} color={theme.colors.text.secondary} />
  </Pressable>;
}
