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

async function extractRefreshToken(client: any): Promise<string | null> {
  // 1. Try getSession() (populated in Vitest mocks or when initialized)
  try {
    const sessionRes = await client.auth.getSession();
    if (sessionRes?.data?.session?.refresh_token) {
      return sessionRes.data.session.refresh_token;
    }
  } catch {
    // ignore
  }

  // 2. Try storage adapter from @supabase/ssr
  try {
    const storage = client?.auth?.storage;
    const storageKey = client?.auth?.storageKey;
    if (storage && storageKey) {
      const raw = await storage.getItem(storageKey);
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (parsed?.refresh_token) return parsed.refresh_token;
      }
    }
  } catch {
    // ignore
  }

  // 3. Fallback: Parse cookies directly from store (handles direct and chunked base64url)
  try {
    const cookieStore = await cookies();
    const all = cookieStore.getAll();
    const authCookies = all.filter((c) => c.name.includes('-auth-token'));
    if (authCookies.length > 0) {
      const baseNames = new Set(authCookies.map((c) => c.name.replace(/\.\d+$/, '')));
      for (const baseName of baseNames) {
        const direct = authCookies.find((c) => c.name === baseName);
        let combined = direct ? direct.value : '';
        if (!combined) {
          const chunks = authCookies
            .filter((c) => c.name.startsWith(baseName + '.'))
            .sort((a, b) => {
              const idxA = parseInt(a.name.split('.').pop() || '0', 10);
              const idxB = parseInt(b.name.split('.').pop() || '0', 10);
              return idxA - idxB;
            });
          combined = chunks.map((c) => c.value).join('');
        }
        if (combined) {
          let raw = combined;
          if (raw.startsWith('base64-')) {
            try {
              raw = Buffer.from(raw.slice(7), 'base64url').toString('utf8');
            } catch {
              // ignore
            }
          }
          try {
            const parsed = JSON.parse(raw);
            if (parsed?.refresh_token) return parsed.refresh_token;
          } catch {
            // ignore
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return null;
}

async function currentAccount() {
  const client = await createClient();
  const { data: verified, error } = await client.auth.getUser();
  if (error || !verified?.user) return null;

  const refreshToken = (await extractRefreshToken(client)) || '';

  return {
    client,
    account: {
      id: verified.user.id,
      label: (verified.user.email || verified.user.user_metadata?.username || 'Conta').slice(
        0,
        160
      ),
      refreshToken,
    } satisfies SavedAccount,
  };
}

export async function GET() {
  const current = await currentAccount();
  if (!current) return json({ error: 'Sessão indisponível.' }, 401);
  const store = await cookies();
  const saved = openAccount(store.get(ACCOUNT_COOKIE)?.value);

  let currentUser: {
    id: string;
    username: string;
    avatar_url: string | null;
    avatar_config: unknown;
  } | null = null;
  let currentUnread = 0;
  let savedUser: {
    id: string;
    username: string;
    avatar_url: string | null;
    avatar_config: unknown;
  } | null = null;
  let savedUnread = 0;

  try {
    const { prisma } = await import('@/lib/prisma');
    if (prisma?.user) {
      currentUser = await prisma.user.findUnique({
        where: { id: current.account.id },
        select: {
          id: true,
          username: true,
          avatar_url: true,
          avatar_config: true,
        },
      });
      currentUnread = await prisma.notification.count({
        where: { userId: current.account.id, read: false },
      });
      if (saved && saved.id !== current.account.id) {
        savedUser = await prisma.user.findUnique({
          where: { id: saved.id },
          select: {
            id: true,
            username: true,
            avatar_url: true,
            avatar_config: true,
          },
        });
        savedUnread = await prisma.notification.count({
          where: { userId: saved.id, read: false },
        });
      }
    }
  } catch {
    // Keep fallback when database is not available
  }

  const getDisplayName = (user: { username: string; avatar_config: unknown } | null) => {
    if (!user) return null;
    const cfg = user.avatar_config as { name?: string } | null;
    return cfg?.name || user.username;
  };

  const savedAccountData =
    saved && saved.id !== current.account.id
      ? {
          id: saved.id,
          label: saved.label,
          username: savedUser?.username ?? saved.label,
          name: getDisplayName(savedUser),
          avatar_url: savedUser?.avatar_url ?? null,
          avatar_config: savedUser?.avatar_config ?? null,
          unreadCount: savedUnread,
        }
      : null;

  const currentAccountData = {
    id: current.account.id,
    label: current.account.label,
    username: currentUser?.username ?? current.account.label,
    name: getDisplayName(currentUser),
    avatar_url: currentUser?.avatar_url ?? null,
    avatar_config: currentUser?.avatar_config ?? null,
    unreadCount: currentUnread,
  };

  return json({
    saved: savedAccountData,
    current: currentAccountData,
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
