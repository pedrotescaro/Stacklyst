import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { visibleUserWhere } from '@/services/block.service';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const whereClause: any = {};
    if (query && query.trim().length > 0) {
      whereClause.username = {
        contains: query,
        mode: 'insensitive',
      };
    }

    const users = await prisma.user.findMany({
      where: { AND: [whereClause, visibleUserWhere(user.id)] },
      select: {
        id: true,
        username: true,
        avatar_url: true,
      },
      take: 5,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}
