import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';

import { darkTheme, lightTheme, type Appearance, type Theme } from './tokens/theme';

const ThemeContext = createContext<Theme | undefined>(undefined);
const ReducedMotionContext = createContext(true);

export function ThemeProvider({ appearance = 'system', children }: { appearance?: Appearance; children: ReactNode }) {
  const systemAppearance = useColorScheme();
  const resolvedAppearance = appearance === 'system' ? systemAppearance : appearance;
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    let active = true;
    let receivedEvent = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      receivedEvent = true;
      setReducedMotion(enabled);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active && !receivedEvent) setReducedMotion(enabled);
    }).catch(() => {
      // The static layout remains usable when a platform cannot report this setting.
    });
    return () => { active = false; subscription.remove(); };
  }, []);

  return (
    <ThemeContext.Provider value={resolvedAppearance === 'dark' ? darkTheme : lightTheme}>
      <ReducedMotionContext.Provider value={reducedMotion}>{children}</ReducedMotionContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider');
  return theme;
}

export function useReducedMotion(): boolean {
  return useContext(ReducedMotionContext);
}
