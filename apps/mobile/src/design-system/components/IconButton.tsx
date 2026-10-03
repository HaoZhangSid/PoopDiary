import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../ThemeProvider';
import { renderIcon, type IconProp } from './Icon';

export type IconButtonProps = { label: string; icon: IconProp; onPress: () => void; disabled?: boolean; testID?: string };

export function IconButton({ label, icon, onPress, disabled = false, testID }: IconButtonProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => ({
        minHeight: theme.controls.minimumTouchTarget,
        minWidth: theme.controls.minimumTouchTarget,
        borderRadius: theme.radius.sm,
        borderWidth: theme.controls.borderWidth,
        borderColor: 'transparent',
        outlineColor: theme.colors.focus,
        outlineWidth: focused ? theme.controls.selectedBorderWidth : 0,
        outlineOffset: theme.spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed || disabled ? theme.colors.surface.subtle : 'transparent',
      })}
    >
      <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {renderIcon(icon, disabled ? theme.colors.text.disabled : theme.colors.text.primary, theme.controls.icon)}
      </View>
    </Pressable>
  );
}
