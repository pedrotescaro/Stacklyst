import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';
import { api, send } from './api';
import { loadNotifications, notificationsUnavailableMessage } from './notification-runtime';
export async function enablePush() {
  const Notifications = await loadNotifications();
  if (!Notifications) throw new Error(notificationsUnavailableMessage);
  if (Platform.OS === 'web' || !Device.isDevice)
    throw new Error('Push requer um aparelho físico e development build.');
  if (!config.projectId)
    throw new Error('Configure EXPO_PUBLIC_EAS_PROJECT_ID antes de ativar push.');
  if (Platform.OS === 'android')
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Atividade do Stacklyst',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  const permission = await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted')
    throw new Error('Permissão não concedida. Você pode ativá-la nas configurações do aparelho.');
  const token = (await Notifications.getExpoPushTokenAsync({ projectId: config.projectId })).data;
  await send('/api/mobile/devices', { token, enabled: true }, 'PUT');
  await AsyncStorage.setItem('stacklyst-push-token', token);
  return token;
}
export async function disablePush(signal?: AbortSignal) {
  const token = await AsyncStorage.getItem('stacklyst-push-token');
  if (signal?.aborted) return;
  if (token)
    await api('/api/mobile/devices', {
      method: 'DELETE',
      body: JSON.stringify({ token }),
      signal,
    });
  await AsyncStorage.removeItem('stacklyst-push-token');
}
/** Notification cleanup must never hold the local logout behind the network. */
export async function clearNotificationsForLogout(timeoutMs = 1500) {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      Promise.allSettled([disablePush(controller.signal), cancelReminder()]),
      new Promise<void>((resolve) => {
        timer = setTimeout(() => {
          controller.abort();
          resolve();
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
export async function setReminder(hour: number, minute: number) {
  const Notifications = await loadNotifications();
  if (!Notifications) throw new Error(notificationsUnavailableMessage);
  const p = await Notifications.requestPermissionsAsync();
  if (p.status !== 'granted') throw new Error('Permita notificações para criar o lembrete.');
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hora de aprender',
      body: 'Continue seu caminho no Stacklyst.',
      data: { url: '/learn' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}
export async function cancelReminder() {
  const Notifications = await loadNotifications();
  if (Notifications) await Notifications.cancelAllScheduledNotificationsAsync();
}
