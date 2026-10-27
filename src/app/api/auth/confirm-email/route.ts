import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/ratelimit';

const confirmEmailSchema = z.object({
  email: z.string().email('Endereço de e-mail inválido'),
  token: z.string().min(1).optional(),
  token_hash: z.string().min(1).optional(),
  action: z.enum(['verify', 'resend']).default('verify'),
});

export const POST = apiHandler(
  async (request) => {
    const body = await request.json();
    const { email, token, token_hash, action } = confirmEmailSchema.parse(body);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    await rateLimit(`confirm-email:${ip}`, {
      limit: 10,
      window: '1 h',
      endpoint: '/api/auth/confirm-email',
    });

    // Verification requires either token (OTP) or token_hash
    if (action === 'verify' && !token && !token_hash) {
      return NextResponse.json(
        { error: 'Token ou código de confirmação é obrigatório.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    try {
      if (action === 'resend') {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim().toLowerCase(),
          options: {
            emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback?next=/onboarding`,
          },
        });
        if (error) {
          logger.warn('Confirmation email delivery failed', {
            code: error.code,
            status: error.status,
          });
          return NextResponse.json(
            { error: 'Não foi possível reenviar agora. Aguarde alguns minutos.' },
            { status: 503 }
          );
        }
        return NextResponse.json({ success: true, confirmed: false });
      }
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

      logger.info('User email verified successfully', { userId: data.user?.id });
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
  },
  { resolveSession: false }
);
