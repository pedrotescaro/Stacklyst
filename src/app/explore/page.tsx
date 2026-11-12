import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { ExploreContent } from './ExploreContent';

export const revalidate = 0;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; tab?: string | string[] }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect('/login?reason=session_expired');

  const { q, tab } = await searchParams;
  const initialQuery = typeof q === 'string' ? q.trim().slice(0, 100) : '';
  const initialTab = tab === 'people' ? 'people' : 'posts';

  return (
    <ExploreContent
      initialQuery={initialQuery}
      initialTab={initialTab}
      user={{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        avatar_config: user.avatar_config,
        role: user.role,
        total_xp: user.total_xp,
        streak: Math.max(
          user.streak_days,
          ...user.trails.map((trail: { streak: number }) => trail.streak)
        ),
        last_active_at: user.last_active_at?.toISOString() ?? null,
        trails: user.trails
          .map((trail: { id: string; language: string; xp: number; level: number }) => ({
            id: trail.id,
            language: trail.language,
            xp: trail.xp,
            level: trail.level,
          }))
          .sort((a: { xp: number }, b: { xp: number }) => b.xp - a.xp),
      }}
    />
  );
}
