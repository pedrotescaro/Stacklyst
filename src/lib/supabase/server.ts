import './dev-ssl';
import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { getSupabasePublicConfig } from '@/lib/supabase/env';

export async function createClient() {
  const cookieStore = await cookies();

  const { url, key } = getSupabasePublicConfig();
  const authorization = (await headers()).get('authorization');

  return createServerClient(url, key, {
    ...(authorization !== null ? { global: { headers: { Authorization: authorization } } } : {}),
    cookies: {
      getAll() {
        // Native authorization is independent from any browser session sent with it.
        if (authorization !== null) return [];
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        if (authorization !== null) return;
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
