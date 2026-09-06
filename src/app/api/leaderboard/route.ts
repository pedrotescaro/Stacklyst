import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import { calculateLevel, XP_RANK_ORDER } from '@/lib/learning/rewards';
import { getLanguageLeaderboard } from '@/lib/learning/language-xp';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');

    if (language) {
      if (!Object.values(Language).includes(language as Language))
        return NextResponse.json({ error: 'Linguagem inválida' }, { status: 400 });
      // Leaderboard filtrado por linguagem
      const leaders = await getLanguageLeaderboard(language as Language);

      const formatted = leaders.map((leader, index) => ({
        rank: index + 1,
        username: leader.username,
        avatar_url: leader.avatar_url,
        xp: leader.xp,
        level: calculateLevel(leader.xp).level,
      }));

      return NextResponse.json(formatted);
    } else {
      // Leaderboard global baseado no total_xp do usuário
      const leaders = await prisma.user.findMany({
        orderBy: XP_RANK_ORDER,
        take: 10,
        select: {
          username: true,
          avatar_url: true,
          total_xp: true,
        },
      });

      const formatted = leaders.map((leader, index) => ({
        rank: index + 1,
        username: leader.username,
        avatar_url: leader.avatar_url,
        xp: leader.total_xp,
        level: calculateLevel(leader.total_xp).level,
      }));

      return NextResponse.json(formatted);
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Erro ao buscar ranking' }, { status: 500 });
  }
}
