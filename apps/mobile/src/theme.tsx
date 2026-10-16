import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';

const dark = {
  background: '#000000',
  surface: '#111316',
  elevated: '#1a1e23',
  ownMessage: '#0b2b48',
  text: '#f4f6f8',
  muted: '#9da7b3',
  primary: '#0078d4',
  onPrimary: '#ffffff',
  border: '#292d33',
  success: '#63d99b',
  successSurface: '#153c2b',
  onSuccess: '#002616',
  dangerSurface: '#34191e',
  like: '#ff678b',
  danger: '#ff8c95',
  warning: '#f2cb6d',
};
export type Palette = typeof dark;
const light: Palette = {
  background: '#ffffff',
  surface: '#f7f9f9',
  elevated: '#eff3f4',
  ownMessage: '#e2f1ff',
  text: '#0f1419',
  muted: '#536471',
  primary: '#0074c8',
  onPrimary: '#ffffff',
  border: '#cfd9de',
  success: '#087d48',
  successSurface: '#e4f5eb',
  onSuccess: '#ffffff',
  dangerSurface: '#ffebee',
  like: '#c72250',
  danger: '#c32240',
  warning: '#826000',
};
export type ThemeMode = 'dark' | 'light' | 'system';
const Context = createContext({
  colors: dark,
  mode: 'dark' as ThemeMode,
  isDark: true,
  setMode: (_mode: ThemeMode) => {},
});
export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, updateMode] = useState<ThemeMode>('dark');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem('stacklyst-appearance')
      .then((value) => {
        if (active && (value === 'dark' || value === 'light' || value === 'system'))
          updateMode(value);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  const isDark = mode === 'dark' || (mode === 'system' && system !== 'light');
  const palette = isDark ? dark : light;
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(palette.background).catch(() => undefined);
  }, [palette]);
  const value = useMemo(
    () => ({
      colors: palette,
      mode,
      isDark,
      setMode: (next: ThemeMode) => {
        updateMode(next);
        void AsyncStorage.setItem('stacklyst-appearance', next).catch(() => undefined);
      },
    }),
    [palette, mode, isDark]
  );
  if (!ready) return null;
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useTheme = () => useContext(Context);
/** Default palette for non-rendering configuration; components use useTheme(). */
export const colors = dark;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { control: 12, panel: 16, pill: 999 } as const;
export const type = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const },
  heading: { fontSize: 20, lineHeight: 27, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 24 },
  secondary: { fontSize: 14, lineHeight: 21 },
  caption: { fontSize: 12, lineHeight: 17 },
};
