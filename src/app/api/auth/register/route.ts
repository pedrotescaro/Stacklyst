import { NextResponse } from 'next/server';
import { hasDatabaseConnection, prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { registerSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/ratelimit';
import { apiHandler } from '@/lib/api-handler';
import { AVATAR_API_URL, DEFAULT_LANGUAGE_TRAILS, RATE_LIMIT_REGISTER } from '@/lib/config';
import { signJwt, setJwtCookie } from '@/lib/jwt';
import { logger } from '@/lib/logger';

export const POST = apiHandler(async (request) => {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // Execute Upstash rate limit
  await rateLimit(`register:${ip}`, {
    ...RATE_LIMIT_REGISTER,
    endpoint: '/api/auth/register',
  });

  const body = await request.json();

  // Validate request body
  const parsed = registerSchema.parse(body);
  const { username, email, password } = parsed;

  if (!hasDatabaseConnection()) {
    return NextResponse.json(
      { error: 'The application database is not configured in this environment.' },
      { status: 503 }
    );
  }

  // Check username unique
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    return NextResponse.json({ error: 'Nome de usuário já está em uso.' }, { status: 400 });
  }

  // Check email unique
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    return NextResponse.json({ error: 'Endereço de e-mail já está em uso.' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdminClient();
  let authUser: { id: string; email?: string } | null = null;
  let isNewlyCreatedAuthUser = false;

  if (supabaseAdmin) {
    // 1. Criar usuário com email pré-confirmado usando client admin (elimina bloqueio de Email not confirmed)
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
      },
    });

    if (adminError) {
      const errMsg = adminError.message.toLowerCase();
      // Se o usuário já existe no Auth mas não no banco (ex: tentativa anterior interrompida)
      if (errMsg.includes('already been registered') || errMsg.includes('already exists')) {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = listData?.users?.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (existingAuthUser) {
          const dbUserCheck = await prisma.user.findUnique({
            where: { id: existingAuthUser.id },
          });

          if (!dbUserCheck) {
            // Conta órfã no Auth: atualizamos senha e confirmamos o email
            const { data: updatedData, error: updateErr } =
              await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
                password,
                email_confirm: true,
                user_metadata: { username },
              });

            if (!updateErr && updatedData.user) {
              authUser = updatedData.user;
            } else {
              return NextResponse.json(
                { error: 'Endereço de e-mail já está em uso.' },
                { status: 400 }
              );
            }
          } else {
            return NextResponse.json(
              { error: 'Endereço de e-mail já está em uso.' },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json({ error: adminError.message }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: adminError.message }, { status: 400 });
      }
    } else {
      authUser = adminData.user;
      isNewlyCreatedAuthUser = true;
    }
  } else {
    // Fallback: cadastro padrão via Supabase SSR
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (authError) {
      const message =
        authError.message === 'fetch failed'
          ? 'Não foi possível conectar ao serviço de autenticação. Verifique sua conexão.'
          : authError.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    authUser = authData.user;
    isNewlyCreatedAuthUser = true;
  }

  if (!authUser) {
    return NextResponse.json(
      { error: 'Não foi possível criar a conta de autenticação.' },
      { status: 500 }
    );
  }

  const avatarBaseUrl = AVATAR_API_URL;

  // 2. Criar registro no banco via Prisma
  try {
    const dbUser = await prisma.user.create({
      data: {
        id: authUser.id,
        username,
        email,
        avatar_url: `${avatarBaseUrl}?seed=${username}`,
        bio: 'New developer on Stacklyst! 🚀',
        total_xp: 0,
      },
    });

    // 3. Inicializar trilhas padrão para o novo usuário
    await prisma.languageTrail.createMany({
      data: DEFAULT_LANGUAGE_TRAILS.map((lang) => ({
        user_id: dbUser.id,
        language: lang as any,
        xp: 0,
        level: 1,
        streak: 0,
      })),
    });

    // 4. Emitir JWT para camada secundária
    try {
      const token = await signJwt({
        userId: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
      });
      await setJwtCookie(token);
      logger.info('JWT issued after registration', { userId: dbUser.id });
    } catch (jwtError) {
      logger.error('Failed to issue JWT after registration', { error: String(jwtError) });
    }

    return NextResponse.json({ success: true, user: dbUser });
  } catch (dbError: any) {
    logger.error('Failed to create user record in database', {
      userId: authUser.id,
      error: dbError?.message || String(dbError),
    });

    // Rollback no Supabase Auth se o registro no banco falhou
    if (supabaseAdmin && isNewlyCreatedAuthUser && authUser?.id) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      } catch (delError) {
        logger.error('Failed to rollback Supabase user creation', { error: String(delError) });
      }
    }

    return NextResponse.json(
      { error: 'Ocorreu um erro ao salvar o perfil no banco de dados. Tente novamente.' },
      { status: 500 }
    );
  }
});
