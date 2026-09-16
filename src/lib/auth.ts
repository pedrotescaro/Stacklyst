import { cache } from 'react';
import { getAuthUserId } from '@/lib/auth-session';
import { hasDatabaseConnection, prisma } from '@/lib/prisma';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { ConnectionError, ForbiddenError, UnauthorizedError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getErrorSummary, isTransientConnectionError } from '@/lib/connection-errors';
import { getEffectiveStreak } from '@/lib/streak';

type SupabaseAdminClient = NonNullable<ReturnType<typeof getSupabaseAdminClient>>;

/** Fetch a user through the direct PostgreSQL connection. */
async function fetchUserViaPrisma(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: { include: { badge: true } },
      trails: true,
    },
  });
}

/**
 * Fetch a user through the Supabase Data API on port 443. This is the fallback
 * for networks that temporarily cannot reach the PostgreSQL pooler.
 */
async function fetchUserViaRest(userId: string, supabaseAdmin: SupabaseAdminClient) {
  const client = supabaseAdmin as any;
  const { data: user, error } = await client
    .from('User')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!user) return null;

  const [badgesRes, trailsRes] = await Promise.all([
    client.from('UserBadge').select('*, badge:Badge(*)').eq('user_id', userId),
    client.from('LanguageTrail').select('*').eq('user_id', userId),
  ]);

  // The core user record is enough to keep the session alive. Related data can
  // degrade to an empty list and recover on the next request.
  if (badgesRes.error) {
    logger.warn('Could not load badges through Supabase REST fallback', {
      userId,
      ...getErrorSummary(badgesRes.error),
    });
  }
  if (trailsRes.error) {
    logger.warn('Could not load trails through Supabase REST fallback', {
      userId,
      ...getErrorSummary(trailsRes.error),
    });
  }

  const trails = (trailsRes.data || []).map((trail: any) => ({
    ...trail,
    last_activity_at: trail.last_activity_at ? new Date(trail.last_activity_at) : null,
  }));

  return {
    ...user,
    created_at: user.created_at ? new Date(user.created_at) : new Date(),
    last_active_at: user.last_active_at ? new Date(user.last_active_at) : null,
    duel_cooldown_until: user.duel_cooldown_until ? new Date(user.duel_cooldown_until) : null,
    birthday: user.birthday ? new Date(user.birthday) : null,
    badges: (badgesRes.data || []).map((userBadge: any) => ({
      ...userBadge,
      earned_at: userBadge.earned_at ? new Date(userBadge.earned_at) : new Date(),
    })),
    trails,
  };
}

/** Try PostgreSQL first and fail over to HTTPS only for transient errors. */
async function findUserWithFallback(userId: string) {
  const supabaseAdmin = getSupabaseAdminClient();

  if (!hasDatabaseConnection()) {
    if (!supabaseAdmin) {
      logger.warn('User data backends are not configured', {
        userId,
        databaseConfigured: false,
        restFallbackConfigured: false,
      });
      throw new ConnectionError(
        'USER_DATA_NOT_CONFIGURED',
        'O acesso aos dados do app ainda não foi configurado neste ambiente.'
      );
    }

    try {
      return await fetchUserViaRest(userId, supabaseAdmin);
    } catch (restError) {
      logger.warn('Supabase REST user data connection failed', {
        userId,
        ...getErrorSummary(restError),
      });
      throw new ConnectionError(
        'USER_DATA_UNAVAILABLE',
        'Conexão temporariamente indisponível. Sua sessão continua ativa.'
      );
    }
  }

  try {
    return await fetchUserViaPrisma(userId);
  } catch (prismaError) {
    if (!isTransientConnectionError(prismaError)) throw prismaError;

    logger.warn('Prisma connection failed, falling back to Supabase REST API', {
      userId,
      restFallbackConfigured: Boolean(supabaseAdmin),
      ...getErrorSummary(prismaError),
    });

    if (!supabaseAdmin) {
      throw new ConnectionError(
        'USER_DATA_UNAVAILABLE',
        'Conexão temporariamente indisponível. Sua sessão continua ativa.'
      );
    }

    try {
      return await fetchUserViaRest(userId, supabaseAdmin);
    } catch (restError) {
      logger.warn('Both user data connections failed', {
        userId,
        prisma: getErrorSummary(prismaError),
        rest: getErrorSummary(restError),
      });
      throw new ConnectionError(
        'USER_DATA_UNAVAILABLE',
        'Conexão temporariamente indisponível. Sua sessão continua ativa.'
      );
    }
  }
}

/**
 * Resolve the authenticated application user.
 *
 * Supabase verified claims remain authoritative and keep refresh-token rotation
 * working. The secondary JWT is accepted only for a temporary Auth/network
 * failure, never for an invalid, missing, expired or revoked session.
 */
export const getAuthUser = cache(async () => {
  try {
    const userId = await getAuthUserId();

    if (!userId) return null;

    const dbUser = await findUserWithFallback(userId);
    if (!dbUser) {
      logger.warn('Authenticated user does not exist in the application database', { userId });
      return null;
    }

    syncUserStreaks(dbUser);
    return dbUser;
  } catch (error) {
    if (error instanceof ConnectionError) throw error;
    if (isTransientConnectionError(error)) {
      logger.warn('Transient connection failure in getAuthUser', getErrorSummary(error));
      throw new ConnectionError(
        'CONNECTION_ERROR',
        'Conexão temporariamente indisponível. Sua sessão continua ativa.'
      );
    }

    logger.error('Error in getAuthUser', getErrorSummary(error));
    throw error;
  }
});

/** Keep aggregate streak fields synchronized without blocking the request. */
function syncUserStreaks(dbUser: any) {
  const now = new Date();
  const effectiveUserStreak = getEffectiveStreak(dbUser.streak_days, dbUser.last_active_at, now);
  const maxTrailStreak = (dbUser.trails || []).reduce(
    (max: number, trail: any) =>
      Math.max(max, getEffectiveStreak(trail.streak, trail.last_activity_at, now)),
    0
  );
  const synchronizedStreak = Math.max(effectiveUserStreak, maxTrailStreak);
  const latestTrailActivity = (dbUser.trails || []).reduce((latest: Date | null, trail: any) => {
    if (!trail.last_activity_at) return latest;
    if (!latest) return trail.last_activity_at;
    return trail.last_activity_at.getTime() > latest.getTime() ? trail.last_activity_at : latest;
  }, null);

  let needsUpdate = false;
  const updateData: any = {};

  if (dbUser.streak_days !== synchronizedStreak) {
    dbUser.streak_days = synchronizedStreak;
    updateData.streak_days = synchronizedStreak;
    needsUpdate = true;
  }

  if (
    latestTrailActivity &&
    (!dbUser.last_active_at || dbUser.last_active_at.getTime() < latestTrailActivity.getTime())
  ) {
    dbUser.last_active_at = latestTrailActivity;
    updateData.last_active_at = latestTrailActivity;
    needsUpdate = true;
  }

  const expiredTrailIds: string[] = [];
  for (const trail of dbUser.trails || []) {
    const eff = getEffectiveStreak(trail.streak, trail.last_activity_at, now);
    if (eff === 0 && trail.streak > 0) {
      trail.streak = 0;
      if (trail.id) expiredTrailIds.push(trail.id);
    }
  }

  if (expiredTrailIds.length > 0 && hasDatabaseConnection()) {
    void prisma.languageTrail
      .updateMany({
        where: { id: { in: expiredTrailIds } },
        data: { streak: 0 },
      })
      .catch((err) =>
        logger.warn('Failed to auto-heal expired trail streaks', getErrorSummary(err))
      );
  }

  if (needsUpdate) {
    const updateViaRest = async () => {
      const supabaseAdmin = getSupabaseAdminClient();
      if (!supabaseAdmin) return;

      try {
        const { error } = await (supabaseAdmin as any)
          .from('User')
          .update(updateData)
          .eq('id', dbUser.id);
        if (!error) return;

        logger.warn('Failed to auto-heal user streak/activity via REST', {
          ...getErrorSummary(error),
        });
      } catch (error) {
        logger.warn('Failed to auto-heal user streak/activity via REST', getErrorSummary(error));
      }
    };

    if (hasDatabaseConnection()) {
      void prisma.user
        .update({ where: { id: dbUser.id }, data: updateData })
        .catch(() => updateViaRest());
    } else {
      void updateViaRest();
    }
  }
}

export async function requireAuth(_req?: Request) {
  const user = await getAuthUser();
  if (!user) {
    throw new UnauthorizedError('UNAUTHORIZED', 'Autenticação necessária');
  }
  return user;
}

export async function requireOwnership(userId: string, resourceUserId: string): Promise<void> {
  if (userId !== resourceUserId) {
    throw new ForbiddenError('FORBIDDEN', 'Você não tem permissão para esta ação');
  }
}

export async function requireRole(allowedRoles: ('USER' | 'EVALUATOR' | 'ADMIN' | 'RECRUITER')[]) {
  const user = await requireAuth();
  const role = (user.role as 'USER' | 'EVALUATOR' | 'ADMIN' | 'RECRUITER') || 'USER';
  if (!allowedRoles.includes(role)) {
    throw new ForbiddenError('FORBIDDEN', 'Permissão insuficiente para acessar este recurso');
  }
  return user;
}

export async function requireAdmin() {
  return requireRole(['ADMIN']);
}

export async function requireEvaluator() {
  return requireRole(['EVALUATOR', 'ADMIN']);
}

export async function requireRecruiter() {
  return requireRole(['RECRUITER', 'ADMIN']);
}
