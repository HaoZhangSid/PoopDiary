import { useState, type CSSProperties } from 'react';
import { View } from 'react-native';

import { useTheme } from '../ThemeProvider';
import { AppText } from './AppText';
import type { SliderProps } from './Slider.types';

export type { SliderProps } from './Slider.types';

export function Slider({ value, onValueChange, minimumValue, maximumValue, step = 1, label, tone = 'primary', testID }: SliderProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const boundedValue = Math.max(minimumValue, Math.min(maximumValue, value));
  const accent = tone === 'primary' ? theme.colors.text.primary : theme.colors.entry[tone].fg;
  const inputStyle: CSSProperties = {
    display: 'block',
    width: '100%',
    minHeight: theme.controls.minimumTouchTarget,
    margin: 0,
    accentColor: accent,
    colorScheme: theme.appearance,
    outlineColor: theme.colors.focus,
    outlineWidth: focused ? theme.controls.selectedBorderWidth : 0,
    outlineStyle: 'solid',
    outlineOffset: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  };

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        {Boolean(label) && <AppText variant="label" style={{ flex: 1 }}>{label}</AppText>}
        <AppText variant="label">{boundedValue}</AppText>
      </View>
      <input
        type="range"
        tabIndex={0}
        value={boundedValue}
        min={minimumValue}
        max={maximumValue}
        step={step}
        aria-label={label}
        aria-valuemin={minimumValue}
        aria-valuemax={maximumValue}
        aria-valuenow={boundedValue}
        data-testid={testID}
        onChange={(event) => onValueChange(event.currentTarget.valueAsNumber)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={inputStyle}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        <AppText variant="caption" tone="secondary">{minimumValue}</AppText>
        <AppText variant="caption" tone="secondary">{maximumValue}</AppText>
      </View>
    </View>
  );
}
