import { View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

import { useTheme } from '../ThemeProvider';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

export type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  decreaseLabel?: string;
  increaseLabel?: string;
  testID?: string;
};

export function Stepper({ value, onChange, min = 0, max = Number.MAX_SAFE_INTEGER, step = 1, suffix, decreaseLabel = 'Decrease', increaseLabel = 'Increase', testID }: StepperProps) {
  const theme = useTheme();
  const boundedValue = Math.max(min, Math.min(max, value));
  const update = (direction: number) => onChange(Math.max(min, Math.min(max, Number((boundedValue + direction * step).toFixed(8)))));
  return (
    <View testID={testID} style={{
      minHeight: theme.controls.minimumTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      padding: theme.spacing.xs,
      borderWidth: theme.controls.borderWidth,
      borderColor: theme.colors.border.control,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface.card,
    }}>
      <IconButton label={decreaseLabel} icon={Minus} disabled={boundedValue <= min} onPress={() => update(-1)} />
      <AppText variant="label" accessibilityLiveRegion="polite" style={{ flex: 1, textAlign: 'center' }}>{boundedValue}{suffix ? ` ${suffix}` : ''}</AppText>
      <IconButton label={increaseLabel} icon={Plus} disabled={boundedValue >= max} onPress={() => update(1)} />
    </View>
  );
}
