import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { api } from './api';
import { safeRoute } from './links';
import { queryClient } from './query';

export const NATIVE_AUTH_CALLBACK = 'stacklyst://auth/callback';
const destinationKey = 'stacklyst:auth:destination';
export interface AuthCallbackParams {
  code?: string;
  token_hash?: string;
  type?: string;
  error?: string;
  error_code?: string;
  error_description?: string;
  returnTo?: string;
}
type Operation = { expires: number; promise: Promise<string> };
const exchanges = new Map<string, Operation>();
const completions = new Map<string, Operation>();

function once(map: Map<string, Operation>, key: string, execute: () => Promise<string>) {
  for (const [entry, operation] of map) if (operation.expires < Date.now()) map.delete(entry);
  const current = map.get(key);
  if (current) return current.promise;
  if (map.size >= 10) map.delete(map.keys().next().value!);
  const promise = execute();
  map.set(key, { expires: Date.now() + 120000, promise });
  void promise.catch(() => map.delete(key));
  return promise;
}

export async function rememberAuthDestination(path?: string) {
  await AsyncStorage.setItem(destinationKey, safeRoute(path));
}

export function parseAuthCallback(rawUrl: string): AuthCallbackParams {
  const url = new URL(rawUrl);
  if (
    url.protocol !== 'stacklyst:' ||
    url.hostname !== 'auth' ||
    url.pathname !== '/callback' ||
    url.username ||
    url.password ||
    url.port
  )
    throw new Error('O retorno do provedor não pertence ao Stacklyst. Tente entrar novamente.');
  if (url.hash || url.searchParams.has('access_token') || url.searchParams.has('refresh_token'))
    throw new Error('Este link usa um formato antigo. Inicie o acesso novamente pelo aplicativo.');
  const result: AuthCallbackParams = {};
  for (const key of [
    'code',
    'token_hash',
    'type',
    'error',
    'error_code',
    'error_description',
    'returnTo',
  ] as const) {
    const value = url.searchParams.get(key);
    if (value) result[key] = value;
  }
  return result;
}

// Router and the auth browser can both deliver the same code. Exchange it only once.
export function exchangeCallback(code: string, type?: 'recovery' | 'email' | 'signup') {
  return once(exchanges, (type ?? 'code') + ':' + code, async () => {
    const { data, error } = type
      ? await supabase.auth.verifyOtp({ token_hash: code, type })
      : await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    if (!data.user || !data.session) throw new Error('Não foi possível confirmar sua identidade.');
    return data.user.id;
  });
}

export function completeAuthCallback(params: AuthCallbackParams): Promise<string> {
  if (params.error || params.error_code || params.error_description)
    return Promise.reject(
      new Error(params.error_description || 'O acesso foi recusado pelo provedor.')
    );
  const otp =
    params.type === 'recovery' || params.type === 'email' || params.type === 'signup'
      ? params.type
      : undefined;
  const credential = params.code || (otp ? params.token_hash : undefined);
  if (!credential || credential.length > 4096)
    return Promise.reject(new Error('Link inválido ou expirado. Inicie o acesso novamente.'));
  return once(completions, (params.code ? 'code:' : `${otp}:`) + credential, async () => {
    const userId = await exchangeCallback(credential, params.code ? undefined : otp);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user.id !== userId)
      throw new Error('Sua sessão mudou. Inicie o acesso novamente.');
    await bootstrapAccount();
    const destination =
      params.returnTo ?? (await AsyncStorage.getItem(destinationKey)) ?? undefined;
    await AsyncStorage.removeItem(destinationKey);
    return params.type === 'recovery' ? '/auth/password' : safeRoute(destination);
  });
}

export async function bootstrapAccount() {
  await api('/api/mobile/auth/bootstrap', { method: 'POST', body: '{}' });
  void queryClient.invalidateQueries({ queryKey: ['me'] });
}
