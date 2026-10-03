import { useEffect, useState, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { useReducedMotion, useTheme } from '../ThemeProvider';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

export type SheetProps = { visible: boolean; title: string; onClose: () => void; children: ReactNode; closeLabel?: string };

/** A bottom sheet with independent backdrop and panel motion. */
export function Sheet({ visible, title, onClose, children, closeLabel = 'Close' }: SheetProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const { height: windowHeight } = useWindowDimensions();
  const [backdropOpacity] = useState(() => new Animated.Value(visible && !reducedMotion ? 0 : visible ? 1 : 0));
  const [sheetProgress] = useState(() => new Animated.Value(visible && !reducedMotion ? 1 : 0));

  useEffect(() => {
    if (!visible) return undefined;
    if (reducedMotion) {
      backdropOpacity.setValue(1);
      sheetProgress.setValue(0);
      return undefined;
    }
    backdropOpacity.setValue(0);
    sheetProgress.setValue(1);
    const animation = Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: theme.motion.normal, useNativeDriver: true }),
      Animated.timing(sheetProgress, { toValue: 0, duration: theme.motion.normal, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [backdropOpacity, reducedMotion, sheetProgress, theme.motion.normal, visible]);

  const close = () => {
    if (reducedMotion) {
      onClose();
      return;
    }
    const animation = Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: theme.motion.normal, useNativeDriver: true }),
      Animated.timing(sheetProgress, { toValue: 1, duration: theme.motion.normal, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => { if (finished) onClose(); });
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' }}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay, opacity: backdropOpacity }]}>
          <Pressable onPress={close} accessible={false} importantForAccessibility="no" style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={{
          width: '100%',
          maxWidth: theme.controls.contentWidth,
          maxHeight: '100%',
          alignSelf: 'center',
          backgroundColor: theme.colors.surface.card,
          borderTopLeftRadius: theme.radius.lg,
          borderTopRightRadius: theme.radius.lg,
          overflow: 'hidden',
          transform: [{ translateY: sheetProgress.interpolate({ inputRange: [0, 1], outputRange: [0, windowHeight] }) }],
        }}>
          <SafeAreaView
            edges={['bottom', 'left', 'right']}
            accessibilityViewIsModal
            onAccessibilityEscape={close}
            style={{
              width: '100%',
              maxWidth: theme.controls.contentWidth,
              // Let the panel reach the bottom edge on short mobile viewports.
              // The ScrollView still bounds long content to the available height.
              maxHeight: '100%',
              alignSelf: 'center',
              backgroundColor: 'transparent',
              borderTopLeftRadius: theme.radius.lg,
              borderTopRightRadius: theme.radius.lg,
              padding: theme.spacing.md,
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <AppText variant="sectionTitle" accessibilityRole="header" style={{ flex: 1 }}>{title}</AppText>
              <IconButton icon={X} label={closeLabel} onPress={close} />
            </View>
            <ScrollView style={{ flexShrink: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: theme.spacing.md, paddingBottom: theme.spacing.md }}>{children}</ScrollView>
          </SafeAreaView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
