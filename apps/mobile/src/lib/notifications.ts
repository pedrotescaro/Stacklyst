import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';
import { send } from './api';
export async function enablePush() {
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
export async function disablePush() {
  const token = await AsyncStorage.getItem('stacklyst-push-token');
  if (token) await send('/api/mobile/devices', { token }, 'DELETE');
  await AsyncStorage.removeItem('stacklyst-push-token');
}
export async function setReminder(hour: number, minute: number) {
  if (Platform.OS === 'web') throw new Error('Lembretes estão disponíveis no app instalado.');
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
  await Notifications.cancelAllScheduledNotificationsAsync();
}
