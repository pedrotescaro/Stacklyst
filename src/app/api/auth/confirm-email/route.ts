import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

const confirmEmailSchema = z.object({
  email: z.string().email('Endereço de e-mail inválido'),
  token: z.string().min(1).optional(),
  token_hash: z.string().min(1).optional(),
  action: z.enum(['verify', 'resend']).default('verify'),
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { email, token, token_hash, action } = confirmEmailSchema.parse(body);

  // Verification requires either token (OTP) or token_hash
  if (action === 'verify' && !token && !token_hash) {
    return NextResponse.json(
      { error: 'Token ou código de confirmação é obrigatório.' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    const { data, error } = token_hash
      ? await supabase.auth.verifyOtp({
          token_hash,
          type: 'email',
        })
      : await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: token!,
          type: 'signup',
        });

    if (error) {
      logger.error('Failed to verify confirmation token', { error: error.message });
      return NextResponse.json(
        { error: 'Token de confirmação inválido ou expirado.' },
        { status: 400 }
      );
    }

    logger.info('User email verified successfully', { userId: data.user?.id, email });
    return NextResponse.json({ success: true, confirmed: true });
  } catch (err: any) {
    logger.error('Unexpected error in confirm-email route', {
      error: err?.message || String(err),
    });
    return NextResponse.json(
      { error: 'Falha ao confirmar e-mail. Tente novamente.' },
      { status: 500 }
    );
  }
});
