import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { config } from './config';

// Chunked secure storage supports refresh sessions larger than one Keychain value.
// A generation pointer is committed last; interrupted writes keep the previous session.
const memory = new Map<string, string>();
const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') return memory.get(key) ?? null;
    const pointer = await SecureStore.getItemAsync(key);
    if (!pointer) return null;
    const { generation, count } = JSON.parse(pointer) as { generation: string; count: number };
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        SecureStore.getItemAsync(key + '.' + generation + '.' + i)
      )
    );
    return chunks.some((c) => c === null) ? null : chunks.join('');
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      memory.set(key, value);
      return;
    }
    const previous = await SecureStore.getItemAsync(key);
    const generation = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const count = Math.ceil(value.length / 1500);
    for (let i = 0; i < count; i++)
      await SecureStore.setItemAsync(
        key + '.' + generation + '.' + i,
        value.slice(i * 1500, (i + 1) * 1500)
      );
    await SecureStore.setItemAsync(key, JSON.stringify({ generation, count }));
    if (previous) {
      const old = JSON.parse(previous);
      await Promise.all(
        Array.from({ length: old.count }, (_, i) =>
          SecureStore.deleteItemAsync(key + '.' + old.generation + '.' + i)
        )
      );
    }
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      memory.delete(key);
      return;
    }
    const previous = await SecureStore.getItemAsync(key);
    await SecureStore.deleteItemAsync(key);
    if (previous) {
      const old = JSON.parse(previous);
      await Promise.all(
        Array.from({ length: old.count }, (_, i) =>
          SecureStore.deleteItemAsync(key + '.' + old.generation + '.' + i)
        )
      );
    }
  },
};
export const supabase = createClient(
  config.supabaseUrl || 'https://unconfigured.supabase.co',
  config.supabaseKey || 'unconfigured',
  {
    auth: {
      storage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      lock: processLock,
    },
  }
);
