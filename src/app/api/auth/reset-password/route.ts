import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { createClient } from '@/lib/supabase/server';
import {
  RECOVERY_COOKIE,
  RECOVERY_COOKIE_OPTIONS,
  verifyRecoveryProof,
} from '@/lib/supabase/password-recovery';
import { AppError } from '@/lib/errors';
import { rateLimit } from '@/lib/ratelimit';

async function recoverySession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const proof = (await cookies()).get(RECOVERY_COOKIE)?.value;
  if (error || !data.user || !verifyRecoveryProof(proof, data.user.id)) {
    throw new AppError(
      'RECOVERY_LINK_REQUIRED',
      'Este link é inválido ou expirou. Solicite um novo e-mail de recuperação.',
      401
    );
  }
  return { supabase, user: data.user };
}

export const GET = apiHandler(
  async () => {
    await recoverySession();
    return NextResponse.json(
      { valid: true },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  },
  { resolveSession: false }
);

export const POST = apiHandler(
  async (request) => {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin)
      throw new AppError('INVALID_ORIGIN', 'Origem inválida.', 403);
    const { supabase, user } = await recoverySession();
    const { password } = z
      .object({ password: z.string().min(8).max(128) })
      .parse(await request.json());
    await rateLimit(`password-update:${user.id}`, {
      limit: 5,
      window: '15 m',
      endpoint: '/api/auth/reset-password',
    });
    const { error } = await supabase.auth.updateUser({ password });
    if (error)
      throw new AppError(
        'PASSWORD_UPDATE_FAILED',
        'Não foi possível alterar a senha. Solicite um novo link e tente novamente.',
        400
      );
    const response = NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
    response.cookies.set(RECOVERY_COOKIE, '', { ...RECOVERY_COOKIE_OPTIONS, maxAge: 0 });
    return response;
  },
  { resolveSession: false }
);
