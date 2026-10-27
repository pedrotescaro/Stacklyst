import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { SessionProvider, useSession } from '../src/lib/session';
import { queryClient } from '../src/lib/query';
import { ThemeProvider, useTheme } from '../src/theme';
import { AppDrawer } from '../src/components/AppDrawer';
import { useReducedMotion } from '../src/lib/motion';
import { notificationRoute } from '../src/lib/links';
import { loadNotifications, type NotificationResponse } from '../src/lib/notification-runtime';
import { SoundEffectsProvider } from '../src/lib/sounds';
import { PlatformPresence } from '../src/components/PlatformPresence';
function NotificationLinks() {
  const navigation = useRootNavigationState();
  const { ready } = useSession();
  const [pending, setPending] = useState<NotificationResponse | null>(null);
  const handled = useRef(new Set<string>());
  useEffect(() => {
    let active = true;
    let sub: { remove: () => void } | undefined;
    void loadNotifications()
      .then(async (notifications) => {
        if (!active || !notifications) return;
        sub = notifications.addNotificationResponseReceivedListener(setPending);
        const response = await notifications.getLastNotificationResponseAsync();
        if (active && response) setPending(response);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      sub?.remove();
    };
  }, []);
  useEffect(() => {
    if (!ready || !navigation?.key || !pending) return;
    const identifier = pending.notification.request.identifier;
    if (handled.current.has(identifier)) return;
    handled.current.add(identifier);
    const url = pending.notification.request.content.data?.url;
    router.push(notificationRoute(typeof url === 'string' ? url : undefined) as never);
    void loadNotifications()
      .then((notifications) => notifications?.clearLastNotificationResponseAsync())
      .catch(() => undefined);
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
              <SoundEffectsProvider>
                <AppDrawer>
                  <Navigation />
                </AppDrawer>
              </SoundEffectsProvider>
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
      <PlatformPresence />
    </>
  );
}
