import { NextResponse } from 'next/server';
import { hasDatabaseConnection, prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { AVATAR_API_URL, DEFAULT_LANGUAGE_TRAILS } from '@/lib/config';
import { signJwt, setJwtCookie } from '@/lib/jwt';
import { logger } from '@/lib/logger';
import { getOAuthSignupBio } from '@/lib/supabase/oauth';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/feed';
  // Accept only local absolute paths, never authority/credential URL syntax.
  const destination = new URL('/feed', origin);
  if (next.startsWith('/') && !next.startsWith('//') && !/[\\\u0000-\u001f\u007f]/.test(next)) {
    const candidate = new URL(next, origin);
    if (candidate.origin === origin) {
      destination.pathname = candidate.pathname;
      destination.search = candidate.search;
      destination.hash = candidate.hash;
    }
  }

  if (code && !hasDatabaseConnection()) {
    const message = 'The application database is not configured in this environment.';
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error('OAuth Code Exchange Error', { error: error.message });
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (data?.user) {
      const email = data.user.email;
      const provider = data.user.app_metadata?.provider || 'github';
      const username =
        data.user.user_metadata?.preferred_username ||
        data.user.user_metadata?.username ||
        data.user.user_metadata?.full_name?.replace(/\s+/g, '_').toLowerCase() ||
        `user_${data.user.id.substring(0, 8)}`;

      try {
        // Verificar se o usuário já existe no banco PostgreSQL via Prisma
        const existingUser = await prisma.user.findUnique({
          where: { id: data.user.id },
        });

        let finalUsername = username;

        if (!existingUser) {
          // Garantir que o username é único no banco
          const userWithSameName = await prisma.user.findUnique({
            where: { username: finalUsername },
          });
          if (userWithSameName) {
            finalUsername = `${username}_${data.user.id.substring(0, 4)}`;
          }

          const avatarBaseUrl = AVATAR_API_URL;

          // Configurar campos específicos do provedor
          const isDiscord = provider === 'discord';
          const isGithub = provider === 'github';

          // Criar usuário no banco
          const dbUser = await prisma.user.create({
            data: {
              id: data.user.id,
              username: finalUsername,
              email: email!,
              avatar_url:
                data.user.user_metadata?.avatar_url || `${avatarBaseUrl}?seed=${finalUsername}`,
              bio: getOAuthSignupBio(provider),
              github_username: isGithub ? username : null,
              discord_username: isDiscord
                ? data.user.user_metadata?.full_name ||
                  data.user.user_metadata?.custom_claims?.global_name ||
                  username
                : null,
              total_xp: 0,
            },
          });

          // Inicializar trilhas de linguagem padrões
          await prisma.languageTrail.createMany({
            data: DEFAULT_LANGUAGE_TRAILS.map((lang) => ({
              user_id: dbUser.id,
              language: lang as any,
              xp: 0,
              level: 1,
              streak: 0,
            })),
          });
        } else {
          finalUsername = existingUser.username;
        }

        // ── Issue JWT token for secondary auth layer ───────────
        try {
          const token = await signJwt({
            userId: data.user.id,
            username: finalUsername,
            email: email!,
          });
          await setJwtCookie(token);
          logger.info('JWT issued after OAuth login', { userId: data.user.id });
        } catch (jwtError) {
          logger.error('Failed to issue JWT after OAuth', { error: String(jwtError) });
          // Non-fatal — Supabase session still works
        }
      } catch (dbError) {
        logger.error('Database sync error during OAuth signup', { error: String(dbError) });
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent('Erro ao sincronizar dados com o banco de dados.')}`
        );
      }
    }
  }

  // Redirecionar para o destino
  return NextResponse.redirect(destination);
}
