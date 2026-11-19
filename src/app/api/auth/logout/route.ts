import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { removeJwtCookie } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { ACCOUNT_COOKIE } from '@/lib/supabase/account-vault';
import { SPOTIFY_SESSION_COOKIE, cookieOptions } from '@/lib/spotify-connect';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await removeJwtCookie();
  const store = await cookies();
  store.delete(ACCOUNT_COOKIE);
  // Spotify tokens are bound to this user; do not leave them on a shared browser.
  store.set(SPOTIFY_SESSION_COOKIE, '', cookieOptions(0));
  return NextResponse.json({ ok: true });
}
