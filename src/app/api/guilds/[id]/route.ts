import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';

export const GET = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const guildId: string = String(id);

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      owner: { select: { id: true, username: true, avatar_url: true, total_xp: true } },
      members: {
        include: {
          user: { select: { id: true, username: true, avatar_url: true, total_xp: true } },
        },
        orderBy: { joined_at: 'asc' },
      },
      _count: { select: { members: true } },
    },
  });

  if (!guild) {
    throw new AppError('GUILD_NOT_FOUND', 'Guilda não encontrada', 404);
  }

  const userMembership = guild.members.find((m) => m.user_id === user.id);
  if (!guild.is_public && !userMembership && guild.owner_id !== user.id) {
    throw new AppError('GUILD_NOT_FOUND', 'Guilda não encontrada', 404);
  }

  return NextResponse.json({
    id: guild.id,
    name: guild.name,
    slug: guild.slug,
    description: guild.description,
    icon: guild.icon,
    language: guild.language,
    is_public: guild.is_public,
    created_at: guild.created_at.toISOString(),
    owner: guild.owner,
    memberCount: guild._count.members,
    members: guild.members.map((m) => ({
      id: m.id,
      role: m.role,
      joined_at: m.joined_at.toISOString(),
      user: m.user,
    })),
    userRole: userMembership?.role || null,
    isMember: !!userMembership,
  });
});

export const PATCH = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const guildId: string = String(id);

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: { members: { where: { user_id: user.id } } },
  });

  if (!guild) throw new AppError('GUILD_NOT_FOUND', 'Guilda não encontrada', 404);

  const membership = guild.members[0];
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    throw new AppError('FORBIDDEN', 'Apenas admin/owner pode editar a guilda', 403);
  }

  const body = await req.json();
  const data: any = {};
  if (body.name) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.language !== undefined) data.language = body.language;

  const updated = await prisma.guild.update({
    where: { id: guildId },
    data,
    include: {
      _count: { select: { members: true } },
      owner: { select: { username: true, avatar_url: true } },
    },
  });

  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const guildId: string = String(id);

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: { members: { where: { user_id: user.id, role: 'OWNER' } } },
  });

  if (!guild) throw new AppError('GUILD_NOT_FOUND', 'Guilda não encontrada', 404);
  if (guild.members.length === 0) {
    throw new AppError('FORBIDDEN', 'Apenas o owner pode excluir a guilda', 403);
  }

  await prisma.guild.delete({ where: { id: guildId } });

  return NextResponse.json({ success: true });
});
