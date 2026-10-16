import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { config } from './config';
import { supabase } from './supabase';
import {
  NATIVE_AUTH_CALLBACK,
  rememberAuthDestination,
  parseAuthCallback,
  completeAuthCallback,
} from './auth-callback';

export type OAuthProvider = 'google' | 'github' | 'discord';
export function nativeOAuthAvailable() {
  return Platform.OS !== 'web' && !isRunningInExpoGo();
}
export const nativeOAuthMessage =
  'Para entrar com Google, GitHub ou Discord, use o app instalado. No Expo Go, entre com e-mail e senha.';

export function getOAuthRedirectUrl() {
  // The allowed HTTPS callback only forwards a PKCE code to the fixed native URI.
  // It never logs into the website, sets a web cookie or exchanges tokens.
  const target = new URL('/api/auth/callback', config.apiUrl);
  target.searchParams.set('client', 'mobile');
  return target.toString();
}

export async function signInWithProvider(provider: OAuthProvider, returnTo?: string) {
  if (!nativeOAuthAvailable()) throw new Error(nativeOAuthMessage);
  await rememberAuthDestination(returnTo);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: getOAuthRedirectUrl(), skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error('O provedor não retornou um endereço de acesso.');
  const result = await WebBrowser.openAuthSessionAsync(data.url, NATIVE_AUTH_CALLBACK);
  if (result.type !== 'success') return null;
  return completeAuthCallback(parseAuthCallback(result.url));
}
