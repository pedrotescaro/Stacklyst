import { notifyMentions } from '@/services/mention-notifications';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { isOwnedProfileUpload } from '@/lib/profile-upload';
import type { Prisma } from '@prisma/client';
import { bumpProfileVersion } from '@/lib/profile-version';

import { USERNAME_COOLDOWN_MS } from '@/lib/username';
import { AppError } from '@/lib/errors';

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
      avatar_url,
    } = await request.json();

    if (
      avatar_url !== undefined &&
      avatar_url !== null &&
      !isOwnedProfileUpload(avatar_url, user.id)
    ) {
      return NextResponse.json(
        { error: 'Envie uma foto pelo seletor de imagens do seu perfil.' },
        { status: 400 }
      );
    }

    if (username !== undefined && typeof username !== 'string')
      return NextResponse.json({ error: 'Nome de usuário inválido.' }, { status: 400 });
    const cleanUsername = username?.trim().toLowerCase();
    if (cleanUsername !== undefined) {
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
    }

    const hasNameUpdate = name !== undefined && typeof name === 'string';
    const hasConfigUpdate =
      avatar_config && typeof avatar_config === 'object' && !Array.isArray(avatar_config);
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Share the customization lock so legacy edits never overwrite earned decorations.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('stacklyst:profile:' || ${user.id}))`;
      const current = await tx.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { avatar_config: true, username: true, username_changed_at: true, bio: true },
      });
      const changingUsername =
        cleanUsername !== undefined && cleanUsername !== current.username.toLowerCase();
      if (changingUsername) {
        const availableAt = current.username_changed_at
          ? current.username_changed_at.getTime() + USERNAME_COOLDOWN_MS
          : 0;
        if (availableAt > Date.now())
          throw new AppError(
            'USERNAME_COOLDOWN',
            'Você pode alterar seu nome de usuário a cada 3 minutos.',
            429,
            { usernameChangeAvailableAt: new Date(availableAt).toISOString() }
          );
        const taken = await tx.user.findFirst({
          where: { username: { equals: cleanUsername, mode: 'insensitive' }, id: { not: user.id } },
          select: { id: true },
        });
        if (taken)
          throw new AppError('USERNAME_TAKEN', 'Este nome de usuário já está em uso.', 409);
      }
      if (typeof bio === 'string')
        await notifyMentions(tx, user.id, bio, {
          type: 'PROFILE',
          id: user.id,
          previousBio: current.bio,
        });
      let updatedAvatarConfig: Prisma.InputJsonObject | undefined;
      if (hasNameUpdate || hasConfigUpdate) {
        const currentConfig =
          current.avatar_config &&
          typeof current.avatar_config === 'object' &&
          !Array.isArray(current.avatar_config)
            ? current.avatar_config
            : {};
        const { profileStyle: _reservedStyle, ...allowedConfig } = hasConfigUpdate
          ? avatar_config
          : {};
        updatedAvatarConfig = { ...currentConfig, ...allowedConfig };
        if (hasNameUpdate) {
          const cleanName = name.trim().slice(0, 50);
          updatedAvatarConfig = { ...updatedAvatarConfig, name: cleanName, displayName: cleanName };
        }
      }
      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          username: changingUsername ? cleanUsername : undefined,
          username_changed_at: changingUsername ? new Date() : undefined,
          bio: bio !== undefined ? bio : undefined,
          institution: institution !== undefined ? institution : undefined,
          github_username: github_username !== undefined ? github_username : undefined,
          discord_username: discord_username !== undefined ? discord_username : undefined,
          banner_url: banner_url !== undefined ? banner_url : undefined,
          pronouns: pronouns !== undefined ? pronouns : undefined,
          birthday: birthday !== undefined ? (birthday ? new Date(birthday) : null) : undefined,
          avatar_url: avatar_url !== undefined ? avatar_url : undefined,
          avatar_config: updatedAvatarConfig !== undefined ? updatedAvatarConfig : undefined,
        },
      });
      await bumpProfileVersion(tx, user.id);
      return updated;
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof AppError)
      return NextResponse.json(
        { error: error.message, code: error.code, ...(error.details ?? {}) },
        { status: error.statusCode }
      );
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002')
      return NextResponse.json(
        { error: 'Este nome de usuário já está em uso.', code: 'USERNAME_TAKEN' },
        { status: 409 }
      );
    console.error('Error updating profile settings:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
