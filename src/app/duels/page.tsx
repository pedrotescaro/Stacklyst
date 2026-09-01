import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { DuelsContent } from './DuelsContent';
import { runDuelMaintenance } from '@/lib/duels/lifecycle';

export const revalidate = 0; // Desabilitar cache para dados dinâmicos de duelos

export default async function DuelsPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  await runDuelMaintenance().catch((error) => {
    console.error('Error running duel maintenance:', error);
  });

  // Buscar todos os duelos
  const duels = await prisma.duel.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      challenger: {
        select: { id: true, username: true, avatar_url: true },
      },
      opponent: {
        select: { id: true, username: true, avatar_url: true },
      },
      solutions: {
        select: {
          user_id: true,
          vote_count: true,
        },
      },
    },
  });

  const serializedDuels = duels.map((duel) => ({
    ...duel,
    created_at: duel.created_at.toISOString(),
    match_deadline: duel.match_deadline?.toISOString() ?? null,
    started_at: duel.started_at?.toISOString() ?? null,
    finished_at: duel.finished_at?.toISOString() ?? null,
    xp_awarded_at: duel.xp_awarded_at?.toISOString() ?? null,
  }));

  return (
    <DuelsContent
      user={{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        total_xp: user.total_xp,
      }}
      initialDuels={serializedDuels}
    />
  );
}
