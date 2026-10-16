import 'server-only';
import { createHash } from 'node:crypto';
import type { User } from '@supabase/supabase-js';
import { hasDatabaseConnection, prisma } from '@/lib/prisma';
import { AVATAR_API_URL, DEFAULT_LANGUAGE_TRAILS } from '@/lib/config';
import { AppError, ConnectionError, ValidationError } from '@/lib/errors';
import { getOAuthSignupBio } from '@/lib/supabase/oauth';
import { isTransientConnectionError } from '@/lib/connection-errors';

const userSelect = { id: true, username: true } as const;
const MAX_CREATE_ATTEMPTS = 5;

function metadataText(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === 'string' ? value.trim().slice(0, 200) : '';
}

function initialUsername(user: User) {
  const metadata = user.user_metadata;
  const suggested =
    metadataText(metadata, 'preferred_username') ||
    metadataText(metadata, 'username') ||
    metadataText(metadata, 'full_name');
  const normalized = suggested
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20);
  return normalized.length >= 3 ? normalized : `user_${user.id.replace(/-/g, '').slice(0, 8)}`;
}

function usernameForAttempt(base: string, userId: string, attempt: number) {
  if (attempt === 0) return base;
  const suffix = createHash('sha256').update(`${userId}:${attempt}`).digest('hex').slice(0, 8);
  return `${base.slice(0, 11)}_${suffix}`;
}

function avatarUrl(user: User, username: string) {
  const value = user.user_metadata.avatar_url;
  if (typeof value === 'string' && value.length <= 2048) {
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' && !url.username && !url.password) return url.toString();
    } catch {
      // Provider profile fields are optional display data, never identity or permissions.
    }
  }
  return `${AVATAR_API_URL}?seed=${encodeURIComponent(username)}`;
}

function errorCode(error: unknown) {
  return error && typeof error === 'object' && 'code' in error ? error.code : null;
}

/** Only call with the User returned by Supabase Auth's verified getUser(token). */
export async function bootstrapMobileUser(authUser: User) {
  try {
    return await syncApplicationProfile(authUser);
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (isTransientConnectionError(error)) {
      throw new ConnectionError(
        'USER_DATA_UNAVAILABLE',
        'Não foi possível concluir o perfil agora. Sua sessão continua ativa; tente novamente em instantes.'
      );
    }
    throw error;
  }
}

async function syncApplicationProfile(authUser: User) {
  if (!hasDatabaseConnection()) {
    throw new ConnectionError(
      'USER_DATA_NOT_CONFIGURED',
      'O acesso aos dados do app ainda não foi configurado neste ambiente.'
    );
  }

  // Existing profiles, roles, XP and trails belong to the application and are never reset.
  const existing = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: userSelect,
  });
  if (existing) return { user: existing, created: false };

  const email = authUser.email?.trim();
  if (!email) {
    throw new ValidationError(
      'ACCOUNT_EMAIL_REQUIRED',
      'O provedor não disponibilizou um e-mail para concluir a conta. Confira seu e-mail no provedor e tente novamente.'
    );
  }

  // user_metadata supplies display fields only. The server-owned app_metadata selects
  // provider-specific defaults; neither metadata object can grant a database role.
  const provider =
    typeof authUser.app_metadata.provider === 'string' ? authUser.app_metadata.provider : '';
  const baseUsername = initialUsername(authUser);

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const username = usernameForAttempt(baseUsername, authUser.id, attempt);
    try {
      return await prisma.$transaction(async (tx) => {
        const concurrentUser = await tx.user.findUnique({
          where: { id: authUser.id },
          select: userSelect,
        });
        if (concurrentUser) return { user: concurrentUser, created: false };

        const user = await tx.user.create({
          data: {
            id: authUser.id,
            username,
            email,
            avatar_url: avatarUrl(authUser, username),
            bio: getOAuthSignupBio(provider),
            github_username:
              provider === 'github'
                ? metadataText(authUser.user_metadata, 'preferred_username') ||
                  metadataText(authUser.user_metadata, 'username') ||
                  null
                : null,
            discord_username:
              provider === 'discord'
                ? metadataText(authUser.user_metadata, 'full_name') || baseUsername
                : null,
            role: 'USER',
            total_xp: 0,
          },
          select: userSelect,
        });
        await tx.languageTrail.createMany({
          data: DEFAULT_LANGUAGE_TRAILS.map((language) => ({
            user_id: user.id,
            language,
            xp: 0,
            level: 1,
            streak: 0,
          })),
        });
        return { user, created: true };
      });
    } catch (error) {
      const code = errorCode(error);
      if (code === 'P2034') continue; // Retry a transaction serialization conflict.
      if (code !== 'P2002') throw error;

      // A parallel request may have committed this exact identity while we were
      // creating it. Never upsert/update someone else's profile to resolve a collision.
      const winner = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: userSelect,
      });
      if (winner) return { user: winner, created: false };
      const emailOwner = await prisma.user.findUnique({ where: { email }, select: userSelect });
      if (emailOwner && emailOwner.id !== authUser.id) {
        throw new AppError(
          'ACCOUNT_EMAIL_CONFLICT',
          'Não foi possível associar esta autenticação à conta existente. Entre pelo método que você já utiliza.',
          409
        );
      }
      const usernameOwner = await prisma.user.findUnique({
        where: { username },
        select: userSelect,
      });
      if (!usernameOwner) throw error;
    }
  }

  throw new ConnectionError(
    'ACCOUNT_BOOTSTRAP_BUSY',
    'Não foi possível concluir o perfil agora. Tente novamente em instantes.'
  );
}
