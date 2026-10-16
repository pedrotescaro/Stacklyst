import { NextResponse } from 'next/server';
import { hasDatabaseConnection, prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { AVATAR_API_URL, DEFAULT_LANGUAGE_TRAILS } from '@/lib/config';
import { signJwt, setJwtCookie } from '@/lib/jwt';
import { logger } from '@/lib/logger';
import { getOAuthSignupBio } from '@/lib/supabase/oauth';

const mobileCallbackLimits = {
  code: 2048,
  error: 128,
  error_code: 128,
  error_description: 1024,
  type: 16,
  token_hash: 1024,
} as const;

function mobileCallback(searchParams: URLSearchParams) {
  // The PKCE verifier remains in the app. This endpoint only delivers its
  // one-time code to the fixed native callback; it never creates a web session.
  const destination = new URL('stacklyst://auth/callback');
  let invalid = searchParams.getAll('client').length !== 1;
  for (const [name, limit] of Object.entries(mobileCallbackLimits)) {
    const values = searchParams.getAll(name);
    const value = values[0];
    if (
      values.length > 1 ||
      (value && (value.length > limit || /[\u0000-\u001f\u007f]/.test(value)))
    ) {
      invalid = true;
      break;
    }
    if (value) destination.searchParams.set(name, value);
  }
  const type = destination.searchParams.get('type');
  if (type && !['recovery', 'email', 'signup'].includes(type)) invalid = true;
  if (
    !destination.searchParams.has('code') &&
    !destination.searchParams.has('token_hash') &&
    !destination.searchParams.has('error') &&
    !destination.searchParams.has('error_code')
  ) {
    invalid = true;
  }
  if (invalid) {
    destination.search = '';
    destination.searchParams.set('error', 'invalid_callback');
    destination.searchParams.set('error_description', 'Link de acesso inválido ou expirado.');
  }
  // An explicit empty fragment prevents browsers from inheriting an incoming
  // fragment (which could contain tokens) while following this redirect.
  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: destination.toString() + '#',
      'Cache-Control': 'no-store',
      Pragma: 'no-cache',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  if (searchParams.get('client') === 'mobile') return mobileCallback(searchParams);
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
