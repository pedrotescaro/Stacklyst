import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SessionProvider, useSession } from '../src/lib/session';
import { queryClient } from '../src/lib/query';
import { ThemeProvider, useTheme } from '../src/theme';
import { AppDrawer } from '../src/components/AppDrawer';
import { useReducedMotion } from '../src/lib/motion';
import { notificationRoute } from '../src/lib/links';
function NotificationLinks() {
  const navigation = useRootNavigationState();
  const { ready } = useSession();
  const [pending, setPending] = useState<Notifications.NotificationResponse | null>(null);
  const handled = useRef(new Set<string>());
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let active = true;
    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (active && response) setPending(response);
      })
      .catch(() => undefined);
    const sub = Notifications.addNotificationResponseReceivedListener(setPending);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  useEffect(() => {
    if (!ready || !navigation?.key || !pending) return;
    const identifier = pending.notification.request.identifier;
    if (handled.current.has(identifier)) return;
    handled.current.add(identifier);
    const url = pending.notification.request.content.data?.url;
    router.push(notificationRoute(typeof url === 'string' ? url : undefined) as never);
    void Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
    setPending(null);
  }, [ready, navigation?.key, pending]);
  return null;
}
export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SessionProvider>
              <AppDrawer>
                <Navigation />
              </AppDrawer>
            </SessionProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
function Navigation() {
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: reduced ? 'none' : 'slide_from_right',
        }}
      />
      <NotificationLinks />
    </>
  );
}
