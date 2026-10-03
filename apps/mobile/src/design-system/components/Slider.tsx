import { useState } from 'react';
import { View } from 'react-native';
import NativeSlider from '@react-native-community/slider';

import { useTheme } from '../ThemeProvider';
import { AppText } from './AppText';
import type { SliderProps } from './Slider.types';

export type { SliderProps } from './Slider.types';

export function Slider({ value, onValueChange, minimumValue, maximumValue, step = 1, label, showValue = true, tone = 'primary', testID }: SliderProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const boundedValue = Math.max(minimumValue, Math.min(maximumValue, value));
  const accent = tone === 'primary' ? theme.colors.text.primary : theme.colors.entry[tone].fg;
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        {Boolean(label) && <AppText variant="label" style={{ flex: 1 }}>{label}</AppText>}
        {showValue && <AppText variant="label">{boundedValue}</AppText>}
      </View>
      <NativeSlider
        testID={testID}
        value={boundedValue}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: minimumValue, max: maximumValue, now: boundedValue }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        minimumTrackTintColor={accent}
        maximumTrackTintColor={theme.colors.border.control}
        thumbTintColor={accent}
        style={{
          width: '100%',
          minHeight: theme.controls.minimumTouchTarget,
          outlineColor: theme.colors.focus,
          outlineWidth: focused ? theme.controls.selectedBorderWidth : 0,
          outlineOffset: theme.spacing.xs,
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        <AppText variant="caption" tone="secondary">{minimumValue}</AppText>
        <AppText variant="caption" tone="secondary">{maximumValue}</AppText>
      </View>
    </View>
  );
}
