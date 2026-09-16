import { createClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from './env';
import { isTemporaryAuthFailure } from './auth-errors';
import { ConnectionError, UnauthorizedError } from '@/lib/errors';

/** Explicit authorization never falls back to the browser's cookies. */
export async function verifyBearerIdentity(authorization: string) {
  const match = /^Bearer ([^\s]+)$/i.exec(authorization);
  if (!match || match[0] !== authorization)
    throw new UnauthorizedError('INVALID_TOKEN', 'Sessão inválida. Entre novamente.');
  const { url, key } = getSupabasePublicConfig();
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  let result;
  try {
    result = await client.auth.getUser(match[1]);
  } catch (error) {
    if (isTemporaryAuthFailure(error)) {
      throw new ConnectionError(
        'AUTH_TEMPORARILY_UNAVAILABLE',
        'Autenticação indisponível. Tente novamente.'
      );
    }
    throw error;
  }
  const { data, error } = result;
  if (error && isTemporaryAuthFailure(error)) {
    throw new ConnectionError(
      'AUTH_TEMPORARILY_UNAVAILABLE',
      'Autenticação indisponível. Tente novamente.'
    );
  }
  if (error || !data.user)
    throw new UnauthorizedError('INVALID_TOKEN', 'Sessão expirada. Entre novamente.');
  return data.user.id;
}
