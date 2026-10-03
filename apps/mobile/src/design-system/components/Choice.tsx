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
  layout?: 'row' | 'tile';
  badge?: string;
};

export function Choice({ label, description, selected = false, onPress, icon, tone = 'default', testID, disabled = false, selectionRole = 'radio', style, density = 'regular', layout = 'row', badge }: ChoiceProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const toneColors = tone === 'danger' ? theme.colors.feedback.danger : tone === 'default' ? undefined : theme.colors.severity[tone];
  const foreground = disabled ? theme.colors.text.disabled : toneColors?.fg ?? theme.colors.text.primary;
  const selectedBackground = toneColors?.bg ?? theme.colors.surface.subtle;
  const background = selected ? selectedBackground : theme.colors.surface.card;
  const descriptionColor = toneColors ? foreground : theme.colors.text.secondary;
  const tile = layout === 'tile';

  return (
    <Pressable
      testID={testID}
      accessibilityRole={selectionRole}
      accessibilityLabel={badge ? `${badge} ${label}` : label}
      accessibilityHint={description}
      accessibilityState={{ checked: selected, disabled }}
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [{
        minHeight: tile ? theme.controls.choiceTileHeight : theme.controls.minimumTouchTarget,
        padding: density === 'compact' ? theme.spacing.sm : theme.spacing.md,
        paddingTop: tile ? theme.spacing.lg : density === 'compact' ? theme.spacing.sm : theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: theme.controls.borderWidth,
        borderColor: selected ? foreground : theme.colors.border.control,
        outlineColor: theme.colors.focus,
        outlineWidth: focused ? theme.controls.selectedBorderWidth : 0,
        outlineOffset: theme.spacing.xs,
        backgroundColor: pressed && !selected ? selectedBackground : background,
        flexDirection: tile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: tile ? 'center' : undefined,
        position: 'relative',
        gap: theme.spacing.sm,
        transform: [{ scale: pressed && !reducedMotion ? theme.motion.pressedScale : 1 }],
      }, style]}
    >
      {tile && Boolean(badge) && <AppText variant="caption" style={{ position: 'absolute', top: theme.spacing.sm, left: theme.spacing.sm, color: selected ? foreground : theme.colors.text.secondary }}>{badge}</AppText>}
      {Boolean(icon) && <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{renderIcon(icon, foreground, tile ? theme.spacing.xl : theme.controls.icon)}</View>}
      <View style={{ flex: tile ? undefined : 1, width: tile ? '100%' : undefined, minWidth: 0, gap: theme.spacing.xs, alignItems: tile ? 'center' : undefined }}>
        <AppText variant="label" style={{ color: foreground, textAlign: tile ? 'center' : 'left' }}>{label}</AppText>
        {Boolean(description) && <AppText variant="caption" style={{ color: descriptionColor, textAlign: tile ? 'center' : 'left' }}>{description}</AppText>}
      </View>
      <View style={{ width: theme.controls.icon, minHeight: theme.controls.icon, position: tile ? 'absolute' : undefined, top: tile ? theme.spacing.sm : undefined, right: tile ? theme.spacing.sm : undefined }} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {selected && <Check size={tile ? theme.controls.smallIcon : theme.controls.icon} color={foreground} />}
      </View>
    </Pressable>
  );
}
