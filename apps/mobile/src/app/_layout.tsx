import { Stack, DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/bootstrap/AppProviders';
import { useTheme } from '@/design-system';

function Navigation() {
  const theme = useTheme();
  const base = theme.isDark ? DarkTheme : DefaultTheme;
  return <NavigationThemeProvider value={{ ...base, colors: { ...base.colors,
    primary: theme.colors.text.primary, background: theme.colors.surface.canvas,
    card: theme.colors.surface.card, text: theme.colors.text.primary, border: theme.colors.border.default,
    notification: theme.colors.feedback.danger.fg,
  } }}>
    <StatusBar style={theme.isDark ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.surface.canvas } }} />
  </NavigationThemeProvider>;
}
export default function RootLayout() { return <AppProviders><Navigation /></AppProviders>; }
