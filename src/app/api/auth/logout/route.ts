import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { removeJwtCookie } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { ACCOUNT_COOKIE } from '@/lib/supabase/account-vault';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await removeJwtCookie();
  (await cookies()).delete(ACCOUNT_COOKIE);
  return NextResponse.json({ ok: true });
}
