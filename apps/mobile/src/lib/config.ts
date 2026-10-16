export const PRODUCTION_API_URL = 'https://stacklyst.vercel.app';

export const config = {
  // Metro removes the development branch from release bundles. A developer's
  // emulator/LAN .env must never change the backend of the installed APK.
  apiUrl: (__DEV__ ? process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL : PRODUCTION_API_URL)
    .trim()
    .replace(/\/+$/, ''),
  // Supabase must return through its allowed public callback, even when Metro
  // and the API run locally. The callback forwards straight to the native app.
  authCallbackUrl: PRODUCTION_API_URL + '/api/auth/callback?client=mobile',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
  projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? '',
};
export const configured = Boolean(config.apiUrl && config.supabaseUrl && config.supabaseKey);
