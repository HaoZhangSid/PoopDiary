import { Text, type TextProps } from 'react-native';

import { useTheme } from '../ThemeProvider';
import type { TextVariant } from '../tokens/theme';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: 'primary' | 'secondary' | 'danger';
};

export function AppText({ variant = 'body', tone = 'primary', style, ...props }: AppTextProps) {
  const theme = useTheme();
  const color = tone === 'danger' ? theme.colors.feedback.danger.fg : theme.colors.text[tone];
  return <Text {...props} style={[theme.typography[variant], { color, flexShrink: 1 }, style]} />;
}
