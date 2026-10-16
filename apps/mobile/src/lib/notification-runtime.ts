import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

export type { NotificationResponse } from 'expo-notifications';
type Notifications = typeof import('expo-notifications');

// SDK 57's package entry loads a push-topic native module absent from Expo Go.
// Never evaluate that entry in Expo Go, even for local notification helpers.
export function notificationsAvailable() {
  return Platform.OS !== 'web' && !isRunningInExpoGo();
}

let loading: Promise<Notifications | null> | undefined;
export function loadNotifications(): Promise<Notifications | null> {
  if (!notificationsAvailable()) return Promise.resolve(null);
  loading ??= import('expo-notifications').catch(() => null);
  return loading;
}

export const notificationsUnavailableMessage =
  'Use o APK atualizado do Stacklyst para push e lembretes. No Expo Go, acompanhe a aba Notificações.';
