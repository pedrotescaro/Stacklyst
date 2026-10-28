import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

export const GET = apiHandler(async (req, { session, params }) => {
  try {
    const { username } = await params;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().slice(0, 200);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    let cursorTime: Date | null = null;
    let cursorId: string | null = null;
    if (cursor) {
      const parts = cursor.split('_');
      if (parts.length === 2) {
        cursorTime = new Date(parseInt(parts[0], 10));
        cursorId = parts[1];
      }
    }

    const whereClause: any = {
      author: {
        username: { equals: username, mode: 'insensitive' },
      },
    };

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { body: { contains: search, mode: 'insensitive' } },
            { code_snippet: { contains: search, mode: 'insensitive' } },
            { post: { title: { contains: search, mode: 'insensitive' } } },
            { post: { body: { contains: search, mode: 'insensitive' } } },
          ],
        },
      ];
    }

    if (cursorTime && cursorId) {
      whereClause.OR = [
        { created_at: { lt: cursorTime } },
        { created_at: cursorTime, id: { lt: cursorId } },
      ];
    }

    const answers = await prisma.answer.findMany({
      where: whereClause,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            avatar_config: true,
            total_xp: true,
          },
        },
        votes: session?.id ? { where: { user_id: session.id } } : { where: { id: 'none' } },
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar_url: true,
                avatar_config: true,
                total_xp: true,
              },
            },
            votes: session?.id ? { where: { user_id: session.id } } : { where: { id: 'none' } },
            bookmarks: session?.id ? { where: { user_id: session.id } } : { where: { id: 'none' } },
          },
        },
        parent: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar_url: true,
                avatar_config: true,
                total_xp: true,
              },
            },
          },
        },
      },
    });

    const hasNext = answers.length > limit;
    const items = hasNext ? answers.slice(0, limit) : answers;

    let nextCursor = null;
    if (hasNext && items.length > 0) {
      const lastAnswer = items[items.length - 1];
      const lastTime = new Date(lastAnswer.created_at).getTime();
      nextCursor = `${lastTime}_${lastAnswer.id}`;
    }

    return NextResponse.json({
      items,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching user profile replies:', error);
    return NextResponse.json({ error: 'Erro ao buscar respostas' }, { status: 500 });
  }
});
