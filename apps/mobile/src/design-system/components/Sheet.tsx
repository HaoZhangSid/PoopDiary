import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { useReducedMotion, useTheme } from '../ThemeProvider';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

export type SheetProps = { visible: boolean; title: string; onClose: () => void; children: ReactNode; closeLabel?: string };

export function Sheet({ visible, title, onClose, children, closeLabel = 'Close' }: SheetProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  return (
    <Modal visible={visible} transparent animationType={reducedMotion ? 'none' : 'slide'} onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
        <Pressable onPress={onClose} accessible={false} importantForAccessibility="no" style={StyleSheet.absoluteFill} />
        <SafeAreaView
          edges={['bottom', 'left', 'right']}
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          style={{
            width: '100%',
            maxWidth: theme.controls.contentWidth,
            maxHeight: '90%',
            alignSelf: 'center',
            backgroundColor: theme.colors.surface.card,
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            padding: theme.spacing.md,
            gap: theme.spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <AppText variant="sectionTitle" accessibilityRole="header" style={{ flex: 1 }}>{title}</AppText>
            <IconButton icon={X} label={closeLabel} onPress={onClose} />
          </View>
          <ScrollView style={{ flexShrink: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: theme.spacing.md, paddingBottom: theme.spacing.md }}>{children}</ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
