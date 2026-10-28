import { getPeriodLeaderboard } from '@/lib/learning/period-leaderboard';
import { NextResponse } from 'next/server';
import { Language } from '@prisma/client';
import { calculateLevel } from '@/lib/learning/rewards';
import { getGlobalLeaderboard } from '@/lib/learning/leaderboard';
import { getLanguageLeaderboard } from '@/lib/learning/language-xp';
import { getEffectiveStreak } from '@/lib/streak';
import { getLeaderboardAvatarConfig } from '@/lib/leaderboard-identity';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const period = searchParams.get('period');
    if (period) {
      if (
        !['daily', 'weekly', 'monthly'].includes(period) ||
        (language && !Object.values(Language).includes(language as Language))
      )
        return NextResponse.json({ error: 'Filtro inválido' }, { status: 400 });
      return NextResponse.json(
        await getPeriodLeaderboard(
          period as 'daily' | 'weekly' | 'monthly',
          (language as Language) || undefined
        ),
        { headers: { 'Cache-Control': 'private, no-store' } }
      );
    }

    if (language) {
      if (!Object.values(Language).includes(language as Language))
        return NextResponse.json({ error: 'Linguagem inválida' }, { status: 400 });
      // Leaderboard filtrado por linguagem
      const leaders = await getLanguageLeaderboard(language as Language, 50);

      const formatted = leaders.map((leader, index) => ({
        rank: index + 1,
        username: leader.username,
        avatar_url: leader.avatar_url,
        avatar_config: getLeaderboardAvatarConfig(leader.avatar_config),
        xp: leader.xp,
        level: calculateLevel(leader.xp).level,
        streak: getEffectiveStreak(leader.streak_days ?? 0, leader.last_active_at),
        created_at: leader.created_at ? leader.created_at.toISOString() : null,
      }));

      return NextResponse.json(formatted);
    } else {
      return NextResponse.json(await getGlobalLeaderboard(50));
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Erro ao buscar ranking' }, { status: 500 });
  }
}
