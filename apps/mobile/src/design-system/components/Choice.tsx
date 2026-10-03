import { useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';

import { useReducedMotion, useTheme } from '../ThemeProvider';
import { AppText } from './AppText';
import { renderIcon, type IconProp } from './Icon';

export type ChoiceProps = {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconProp;
  tone?: 'default' | 'danger' | 'mild' | 'moderate' | 'severe';
  testID?: string;
  disabled?: boolean;
  selectionRole?: 'radio' | 'checkbox';
  style?: StyleProp<ViewStyle>;
  density?: 'regular' | 'compact';
};

export function Choice({ label, description, selected = false, onPress, icon, tone = 'default', testID, disabled = false, selectionRole = 'radio', style, density = 'regular' }: ChoiceProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const toneColors = tone === 'danger' ? theme.colors.feedback.danger : tone === 'default' ? undefined : theme.colors.severity[tone];
  const foreground = disabled ? theme.colors.text.disabled : toneColors?.fg ?? theme.colors.text.primary;
  const selectedBackground = toneColors?.bg ?? theme.colors.surface.subtle;
  const background = selected ? selectedBackground : theme.colors.surface.card;
  const descriptionColor = toneColors ? foreground : theme.colors.text.secondary;

  return (
    <Pressable
      testID={testID}
      accessibilityRole={selectionRole}
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: selected, disabled }}
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [{
        minHeight: theme.controls.minimumTouchTarget,
        padding: density === 'compact' ? theme.spacing.sm : theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: theme.controls.selectedBorderWidth,
        borderColor: focused ? theme.colors.focus : selected ? foreground : theme.colors.border.control,
        outlineColor: theme.colors.focus,
        outlineWidth: focused ? theme.controls.selectedBorderWidth : 0,
        outlineOffset: theme.spacing.xs,
        backgroundColor: pressed && !selected ? selectedBackground : background,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        transform: [{ scale: pressed && !reducedMotion ? theme.motion.pressedScale : 1 }],
      }, style]}
    >
      {Boolean(icon) && <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{renderIcon(icon, foreground, theme.controls.icon)}</View>}
      <View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
        <AppText variant="label" style={{ color: foreground }}>{label}</AppText>
        {Boolean(description) && <AppText variant="caption" style={{ color: descriptionColor }}>{description}</AppText>}
      </View>
      <View style={{ width: theme.controls.icon, minHeight: theme.controls.icon }} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {selected && <Check size={theme.controls.icon} color={foreground} />}
      </View>
    </Pressable>
  );
}
