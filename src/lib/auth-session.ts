import { cache } from 'react';
import { headers } from 'next/headers';
import { verifyBearerIdentity } from '@/lib/supabase/bearer';
import { createClient } from '@/lib/supabase/server';
import { ConnectionError } from '@/lib/errors';
import { getJwtUser } from '@/lib/jwt';
import { logger } from '@/lib/logger';
import { getErrorSummary } from '@/lib/connection-errors';
import { isTemporaryAuthFailure } from '@/lib/supabase/auth-errors';
import { isSupabasePublicConfigured } from '@/lib/supabase/env';

/** Resolve a verified Supabase user ID without loading application data. */
export const getAuthUserId = cache(async () => {
  const authorization = (await headers()).get('authorization');
  if (authorization !== null) return verifyBearerIdentity(authorization);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  let userId = typeof data?.claims?.sub === 'string' ? data.claims.sub : null;

  if (!userId && error && isTemporaryAuthFailure(error)) {
    const jwtPayload = await getJwtUser();
    userId = jwtPayload?.sub ?? null;

    logger.warn('Temporary Supabase auth failure while resolving user', {
      ...getErrorSummary(error),
      usedJwtFallback: Boolean(userId),
    });

    if (!userId) {
      throw new ConnectionError(
        'AUTH_TEMPORARILY_UNAVAILABLE',
        'Não foi possível renovar sua sessão agora. Tente novamente em instantes.'
      );
    }
  } else if (!userId && error) {
    logger.debug('Supabase session is invalid while resolving user', getErrorSummary(error));
  }

  return userId;
});

/**
 * The public landing page only needs to know whether a session exists. Auth or
 * database outages must not make the marketing page unavailable.
 */
export const getAuthIdentity = cache(async () => {
  if (!isSupabasePublicConfigured()) return null;

  try {
    const userId = await getAuthUserId();
    return userId ? { id: userId } : null;
  } catch (error) {
    logger.warn('Could not resolve the optional landing-page session', getErrorSummary(error));
    return null;
  }
});
