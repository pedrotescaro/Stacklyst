import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

const USERNAME_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const {
      name,
      username,
      bio,
      institution,
      github_username,
      discord_username,
      banner_url,
      pronouns,
      birthday,
      avatar_config,
    } = await request.json();

    let newUsername = undefined;
    let usernameChangedAt: Date | undefined;
    if (username && typeof username === 'string') {
      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername.length < 2 || cleanUsername.length > 30) {
        return NextResponse.json(
          { error: 'O nome de usuário deve ter entre 2 e 30 caracteres.' },
          { status: 400 }
        );
      }
      if (!/^[a-z0-9_-]+$/.test(cleanUsername)) {
        return NextResponse.json(
          { error: 'O nome de usuário só pode conter letras minúsculas, números, _ e -.' },
          { status: 400 }
        );
      }

      if (cleanUsername !== user.username.toLowerCase()) {
        const availableAt = user.username_changed_at
          ? new Date(user.username_changed_at).getTime() + USERNAME_COOLDOWN_MS
          : 0;
        if (availableAt > Date.now()) {
          return NextResponse.json(
            {
              error: `Você poderá mudar seu username novamente em ${new Date(availableAt).toLocaleDateString('pt-BR')}.`,
              code: 'USERNAME_COOLDOWN',
              usernameChangeAvailableAt: new Date(availableAt).toISOString(),
            },
            { status: 429 }
          );
        }

        const existing = await prisma.user.findFirst({
          where: {
            username: { equals: cleanUsername, mode: 'insensitive' },
            id: { not: user.id },
          },
        });

        if (existing) {
          return NextResponse.json(
            { error: 'Este nome de usuário já está em uso por outro desenvolvedor.' },
            { status: 409 }
          );
        }
        newUsername = cleanUsername;
        usernameChangedAt = new Date();
      }
    }

    let updatedAvatarConfig = undefined;
    const currentConfig = (user.avatar_config as any) || {};
    const hasNameUpdate = name !== undefined && typeof name === 'string';
    const hasConfigUpdate = avatar_config && typeof avatar_config === 'object';

    if (hasNameUpdate || hasConfigUpdate) {
      updatedAvatarConfig = {
        ...currentConfig,
        ...(hasConfigUpdate ? avatar_config : {}),
      };
      if (hasNameUpdate) {
        const cleanName = name.trim().slice(0, 50);
        updatedAvatarConfig.name = cleanName;
        updatedAvatarConfig.displayName = cleanName;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: newUsername !== undefined ? newUsername : undefined,
        username_changed_at: usernameChangedAt,
        bio: bio !== undefined ? bio : undefined,
        institution: institution !== undefined ? institution : undefined,
        github_username: github_username !== undefined ? github_username : undefined,
        discord_username: discord_username !== undefined ? discord_username : undefined,
        banner_url: banner_url !== undefined ? banner_url : undefined,
        pronouns: pronouns !== undefined ? pronouns : undefined,
        birthday: birthday !== undefined ? (birthday ? new Date(birthday) : null) : undefined,
        avatar_config: updatedAvatarConfig !== undefined ? updatedAvatarConfig : undefined,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile settings:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
