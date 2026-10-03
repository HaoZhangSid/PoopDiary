import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Hourglass } from 'lucide-react-native';

import { useReducedMotion, useTheme } from '../ThemeProvider';
import { AppText } from './AppText';
import { renderIcon, type IconProp } from './Icon';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  loading?: boolean;
  disabled?: boolean;
  icon?: IconProp;
  testID?: string;
};

export function Button({ label, onPress, variant = 'primary', loading = false, disabled = false, icon, testID }: ButtonProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const inactive = disabled || loading;
  const text = variant === 'text';
  const colors = text
    ? { background: 'transparent', foreground: theme.colors.text.primary, pressed: theme.colors.surface.subtle }
    : theme.colors.action[variant];
  const foreground = inactive ? theme.colors.disabled.foreground : colors.foreground;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      aria-disabled={inactive}
      aria-busy={loading}
      disabled={inactive}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => ({
        minHeight: theme.controls.minimumTouchTarget,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.md,
        borderWidth: !text && (variant === 'secondary' || inactive) ? theme.controls.borderWidth : 0,
        borderColor: inactive ? theme.colors.border.default : variant === 'secondary' ? theme.colors.border.control : 'transparent',
        outlineColor: theme.colors.focus,
        outlineWidth: focused ? theme.controls.selectedBorderWidth : 0,
        outlineOffset: theme.spacing.xs,
        backgroundColor: inactive && !text ? theme.colors.disabled.background : pressed ? colors.pressed : colors.background,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        transform: [{ scale: pressed && !reducedMotion ? theme.motion.pressedScale : 1 }],
      })}
    >
      {(icon || loading) && (
        <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {loading
            ? reducedMotion
              ? <Hourglass size={theme.controls.icon} color={foreground} />
              : <ActivityIndicator size="small" color={foreground} />
            : renderIcon(icon, foreground, theme.controls.icon)}
        </View>
      )}
      <AppText variant="label" style={{ color: foreground, textAlign: 'center' }}>{label}</AppText>
    </Pressable>
  );
}
