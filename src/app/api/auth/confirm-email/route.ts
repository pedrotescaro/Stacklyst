import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

const confirmEmailSchema = z.object({
  email: z.string().email('Endereço de e-mail inválido'),
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { email } = confirmEmailSchema.parse(body);

  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Serviço de confirmação indisponível neste ambiente.' },
      { status: 503 }
    );
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      logger.error('Failed to list users in confirm-email', { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const targetUser = data.users.find(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    );

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    if (!targetUser.email_confirmed_at) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
        email_confirm: true,
      });

      if (updateError) {
        logger.error('Failed to auto-confirm user email', {
          userId: targetUser.id,
          error: updateError.message,
        });
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      logger.info('User email successfully confirmed', { userId: targetUser.id, email });
      return NextResponse.json({ success: true, confirmed: true });
    }

    return NextResponse.json({ success: true, confirmed: true, alreadyConfirmed: true });
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
