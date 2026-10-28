import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient, type Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getSupabasePublicConfig } from '@/lib/supabase/env';
import { removeJwtCookie } from '@/lib/jwt';
import {
  ACCOUNT_COOKIE,
  ACCOUNT_COOKIE_OPTIONS,
  openAccount,
  sealAccount,
  type SavedAccount,
} from '@/lib/supabase/account-vault';

export const dynamic = 'force-dynamic';

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return !!origin && origin === new URL(request.url).origin;
}

function json(data: object, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

async function currentAccount() {
  const client = await createClient();
  const { data: verified, error } = await client.auth.getUser();
  if (error || !verified.user) return null;
  const { data } = await client.auth.getSession();
  if (!data.session || data.session.user.id !== verified.user.id) return null;
  const session: Session = data.session;
  return {
    client,
    account: {
      id: verified.user.id,
      label: (verified.user.email || verified.user.user_metadata?.username || 'Conta').slice(
        0,
        160
      ),
      refreshToken: session.refresh_token,
    } satisfies SavedAccount,
  };
}

export async function GET() {
  const current = await currentAccount();
  if (!current) return json({ error: 'Sessão indisponível.' }, 401);
  const saved = openAccount((await cookies()).get(ACCOUNT_COOKIE)?.value);
  return json({
    saved: saved && saved.id !== current.account.id ? { id: saved.id, label: saved.label } : null,
  });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origem inválida.' }, 403);
  const current = await currentAccount();
  if (!current) return json({ error: 'Sessão indisponível.' }, 401);
  const store = await cookies();
  const saved = openAccount(store.get(ACCOUNT_COOKIE)?.value);
  const body = await request.json().catch(() => null);
  if (body?.action === 'save') {
    if (saved && saved.id !== current.account.id)
      return json({ error: 'Remova a outra conta antes de adicionar uma nova.' }, 409);
    store.set(ACCOUNT_COOKIE, sealAccount(current.account), ACCOUNT_COOKIE_OPTIONS);
    // A secondary JWT for the previous identity must never survive a new login.
    await removeJwtCookie();
    return json({ ok: true });
  }
  if (body?.action !== 'switch' || !saved || saved.id === current.account.id)
    return json({ error: 'Conta salva indisponível.' }, 400);

  // Use a separate, non-persistent client so a failed refresh never overwrites
  // the active browser session. Refresh tokens rotate on each successful use.
  const { url, key } = getSupabasePublicConfig();
  const isolated = createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await isolated.auth.refreshSession({ refresh_token: saved.refreshToken });
  if (error || !data.session || data.user?.id !== saved.id) {
    return json(
      { error: 'Não foi possível trocar de conta. Entre novamente para renovar a sessão.' },
      401
    );
  }
  // Keep the newly rotated token recoverable if setting the active session fails.
  const rotated = { ...saved, refreshToken: data.session.refresh_token };
  store.set(ACCOUNT_COOKIE, sealAccount(rotated), ACCOUNT_COOKIE_OPTIONS);
  const result = await current.client.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
  if (result.error)
    return json({ error: 'Não foi possível trocar de conta. Tente novamente.' }, 503);
  store.set(ACCOUNT_COOKIE, sealAccount(current.account), ACCOUNT_COOKIE_OPTIONS);
  await removeJwtCookie();
  return json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origem inválida.' }, 403);
  if (!(await currentAccount())) return json({ error: 'Sessão indisponível.' }, 401);
  (await cookies()).delete(ACCOUNT_COOKIE);
  return json({ ok: true });
}
