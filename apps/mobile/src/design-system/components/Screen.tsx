import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

import { useTheme } from '../ThemeProvider';
import { AppText } from './AppText';
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
};

export function Screen({ children, title, subtitle, onBack, right, footer, scroll = true, backLabel = 'Back' }: ScreenProps) {
  const theme = useTheme();
  const contentStyle = {
    width: '100%' as const,
    maxWidth: theme.controls.contentWidth,
    alignSelf: 'center' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface.canvas }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      {Boolean(title || subtitle || onBack || right) && (
        <View style={[contentStyle, { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }]}>
          {onBack && <IconButton icon={ArrowLeft} label={backLabel} onPress={onBack} />}
          <View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
            {Boolean(title) && <AppText variant="pageTitle" accessibilityRole="header">{title}</AppText>}
            {Boolean(subtitle) && <AppText tone="secondary">{subtitle}</AppText>}
          </View>
          {Boolean(right) && <View style={{ flexShrink: 1 }}>{right}</View>}
        </View>
      )}
      {scroll
        ? <ScrollView style={{ flex: 1 }} contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">{children}</ScrollView>
        : <View style={[contentStyle, { flex: 1 }]}>{children}</View>}
      {Boolean(footer) && <View style={[contentStyle, { borderTopWidth: theme.controls.borderWidth, borderColor: theme.colors.border.default }]}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
