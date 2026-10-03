import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Leaf } from 'lucide-react-native';

import { useTheme } from '../ThemeProvider';
import { AppText } from './AppText';
import { AppTopbar } from './AppTopbar';
import { IconButton } from './IconButton';

export type ScreenProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  backLabel?: string;
  maxWidth?: number;
  flowBrand?: boolean;
  flowStep?: number;
  flowTotal?: number;
  flowEyebrow?: string;
  /** Render the shared Web-style chrome above a regular page. Flow screens
   * and Today render their own header and pass false. */
  topbar?: boolean;
};

export function Screen({ children, title, subtitle, onBack, right, footer, scroll = true, backLabel = 'Back', maxWidth, flowBrand = false, flowStep, flowTotal, flowEyebrow, topbar = true }: ScreenProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const horizontalPadding = width > 820 ? 0 : theme.spacing.md;
  const showTopbar = topbar && !flowBrand;
  const contentStyle = {
    width: '100%' as const,
    maxWidth: maxWidth ?? theme.controls.contentWidth,
    alignSelf: 'center' as const,
    paddingHorizontal: horizontalPadding,
    paddingTop: showTopbar ? theme.spacing.xl + 2 : theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface.canvas }}>
      {showTopbar && <AppTopbar />}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      {flowBrand && (
        <>
          <View style={[contentStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: theme.spacing.sm }]}>
            <IconButton icon={ArrowLeft} label={backLabel} onPress={onBack ?? (() => undefined)} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}><View style={{ width: theme.controls.icon + theme.spacing.sm, height: theme.controls.icon + theme.spacing.sm, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.action.primary.background }}><Leaf size={theme.controls.smallIcon} color={theme.colors.action.primary.foreground} /></View><AppText variant="label">Poop Diary</AppText></View>
            {right ?? <View style={{ width: theme.controls.minimumTouchTarget }} />}
          </View>
          {flowTotal && flowStep && <View style={[contentStyle, { paddingVertical: 0, gap: 0, marginHorizontal: -20, maxWidth: (maxWidth ?? theme.controls.contentWidth) + 40 }]}><View style={{ height: theme.spacing.xs - theme.controls.borderWidth, borderRadius: theme.radius.pill, overflow: 'hidden', backgroundColor: theme.colors.border.default }}><View style={{ width: `${Math.min(100, flowStep / flowTotal * 100)}%`, height: '100%', backgroundColor: theme.colors.text.primary }} /></View></View>}
        </>
      )}
      {Boolean((title || subtitle || onBack || right) && !flowBrand) && (
        <View style={[contentStyle, { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }]}>
          {onBack && <IconButton icon={ArrowLeft} label={backLabel} onPress={onBack} />}
          <View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
            {Boolean(title) && <AppText variant="pageTitle" accessibilityRole="header">{title}</AppText>}
            {Boolean(subtitle) && <AppText tone="secondary">{subtitle}</AppText>}
          </View>
          {Boolean(right) && <View style={{ flexShrink: 1 }}>{right}</View>}
        </View>
      )}
      {flowBrand && Boolean(title || subtitle) && <View style={[contentStyle, { paddingTop: theme.spacing.xxl + theme.spacing.xs, paddingBottom: theme.spacing.lg, gap: theme.spacing.xs }]}>{Boolean(flowEyebrow) && <AppText variant="caption" tone="secondary" style={{ letterSpacing: theme.typography.label.letterSpacing }}>{flowEyebrow}</AppText>}{Boolean(title) && <AppText variant="heroTitle" accessibilityRole="header">{title}</AppText>}{Boolean(subtitle) && <AppText tone="secondary">{subtitle}</AppText>}{flowStep && flowTotal && <AppText variant="caption" tone="secondary">{flowStep} / {flowTotal}</AppText>}</View>}
      {scroll
        ? <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[contentStyle, footer ? { paddingBottom: theme.spacing.xxl + theme.spacing.lg } : undefined]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >{children}</ScrollView>
        : <View style={[contentStyle, { flex: 1 }]}>{children}</View>}
      {Boolean(footer) && <View style={[contentStyle, { paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.sm, borderTopWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default, backgroundColor: theme.colors.surface.canvas }]}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
