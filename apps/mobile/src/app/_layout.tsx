import { useEffect } from 'react';
import { View } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { Stack, DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/bootstrap/AppProviders';
import { useTheme } from '@/design-system';

function Navigation() {
  const theme = useTheme();
  const base = theme.isDark ? DarkTheme : DefaultTheme;
  useEffect(() => {
    // Native back gestures can briefly reveal the Activity/window behind the
    // navigator. Keep that surface in sync with the app canvas so no white
    // frame flashes between screens (also updates when the theme changes).
    void SystemUI.setBackgroundColorAsync(theme.colors.surface.canvas);
  }, [theme.colors.surface.canvas]);

  return <NavigationThemeProvider value={{ ...base, colors: { ...base.colors,
    primary: theme.colors.text.primary, background: theme.colors.surface.canvas,
    card: theme.colors.surface.card, text: theme.colors.text.primary, border: theme.colors.border.default,
    notification: theme.colors.feedback.danger.fg,
  } }}>
    <StatusBar style={theme.isDark ? 'light' : 'dark'} />
    <View style={{ flex: 1, backgroundColor: theme.colors.surface.canvas }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.surface.canvas } }} />
    </View>
  </NavigationThemeProvider>;
}
export default function RootLayout() { return <AppProviders><Navigation /></AppProviders>; }
