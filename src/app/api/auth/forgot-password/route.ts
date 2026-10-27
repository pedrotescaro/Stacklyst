import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { rateLimit } from '@/lib/ratelimit';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

export const POST = apiHandler(
  async (request) => {
    const { email } = schema.parse(await request.json());
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    await rateLimit(`password-recovery:${ip}`, {
      limit: 5,
      window: '1 h',
      endpoint: '/api/auth/forgot-password',
    });
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/api/auth/callback?next=/reset-password`,
    });
    if (error) {
      logger.warn('Password recovery delivery failed', { code: error.code, status: error.status });
      return NextResponse.json(
        { error: 'Não foi possível enviar o link agora. Tente novamente em alguns minutos.' },
        { status: 503 }
      );
    }
    // The response deliberately does not disclose whether an address is registered.
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  },
  { resolveSession: false }
);
