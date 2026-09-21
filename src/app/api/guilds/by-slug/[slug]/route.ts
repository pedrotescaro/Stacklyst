import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';

export const GET = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { slug } = await params;
  const slugStr: string = String(slug);

  const guild = await prisma.guild.findUnique({
    where: { slug: slugStr },
    include: {
      owner: { select: { id: true, username: true, avatar_url: true, total_xp: true } },
      members: {
        include: {
          user: { select: { id: true, username: true, avatar_url: true, total_xp: true } },
        },
        orderBy: [{ role: 'asc' }, { joined_at: 'asc' }],
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
