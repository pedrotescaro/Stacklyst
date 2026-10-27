import { NextResponse } from 'next/server';
import { hasDatabaseConnection, prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { registerSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/ratelimit';
import { apiHandler } from '@/lib/api-handler';
import { AVATAR_API_URL, DEFAULT_LANGUAGE_TRAILS, RATE_LIMIT_REGISTER } from '@/lib/config';
import { logger } from '@/lib/logger';

export const POST = apiHandler(
  async (request) => {
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

    const supabase = await createClient();
    // Confirmation is owned by Supabase Auth. Never pre-confirm an address or
    // issue an application JWT before the owner follows the emailed link.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback?next=/onboarding`,
      },
    });
    if (authError) {
      return NextResponse.json(
        { error: 'Não foi possível criar a conta. Confira os dados e tente novamente.' },
        { status: 400 }
      );
    }
    const authUser = authData.user;
    if (authUser?.identities?.length === 0) {
      return NextResponse.json({ error: 'Endereço de e-mail já está em uso.' }, { status: 409 });
    }

    if (!authUser) {
      return NextResponse.json(
        { error: 'Não foi possível criar a conta de autenticação.' },
        { status: 500 }
      );
    }

    const avatarBaseUrl = AVATAR_API_URL;

    // 2. Criar registro no banco e trilhas padrão em uma única transação consistente
    try {
      const dbUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            id: authUser.id,
            username,
            email,
            avatar_url: `${avatarBaseUrl}?seed=${username}`,
            bio: 'New developer on Stacklyst! 🚀',
            total_xp: 0,
          },
        });

        await tx.languageTrail.createMany({
          data: DEFAULT_LANGUAGE_TRAILS.map((lang) => ({
            user_id: user.id,
            language: lang as any,
            xp: 0,
            level: 1,
            streak: 0,
          })),
        });

        return user;
      });

      return NextResponse.json({
        success: true,
        requiresEmailConfirmation: !authData.session,
        user: { id: dbUser.id, username: dbUser.username },
      });
    } catch (dbError: any) {
      logger.error('Failed to create user record in database', {
        userId: authUser.id,
        error: dbError?.message || String(dbError),
      });

      // Two simultaneous signup requests can refer to the same Auth user.
      // Never delete that identity on a database conflict: it could already
      // belong to the successful request. A verified email callback can also
      // finish profile provisioning after a temporary database failure.
      if (dbError?.code === 'P2002') {
        return NextResponse.json(
          { error: 'Esta conta ou nome de usuário já foi cadastrado. Entre na sua conta.' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Ocorreu um erro ao salvar o perfil no banco de dados. Tente novamente.' },
        { status: 500 }
      );
    }
  },
  { resolveSession: false }
);
