import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { avatarConfigSchema } from '@/lib/avatar';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const result = avatarConfigSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    return NextResponse.json({ error: 'Configuração de personagem inválida' }, { status: 400 });
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('stacklyst:profile:' || ${user.id}))`;
    const current = await tx.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { avatar_config: true },
    });
    const config =
      current.avatar_config &&
      typeof current.avatar_config === 'object' &&
      !Array.isArray(current.avatar_config)
        ? current.avatar_config
        : {};
    return tx.user.update({
      where: { id: user.id },
      data: { avatar_config: { ...config, ...result.data } },
      select: { id: true, username: true, avatar_config: true },
    });
  });

  return NextResponse.json(updatedUser);
}
