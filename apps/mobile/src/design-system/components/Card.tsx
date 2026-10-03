import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../ThemeProvider';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return <View style={[{
    backgroundColor: theme.colors.surface.card,
    borderColor: theme.colors.border.default,
    borderWidth: theme.controls.borderWidth,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  }, style]}>{children}</View>;
}
