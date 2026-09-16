export const config = {
  apiUrl: (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, ''),
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
  projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? '',
};
export const configured = Boolean(config.apiUrl && config.supabaseUrl && config.supabaseKey);
