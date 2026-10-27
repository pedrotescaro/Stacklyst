import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PostService } from '@/services/post.service';
import { FeedContent } from './FeedContent';
import { ONBOARDING_STATE_KEY, parseOnboarding } from '@/lib/onboarding';

export const revalidate = 0;

export default async function FeedPage() {
  const user = await getAuthUser();

  if (!user) {
    // Permite que o middleware abra o login mesmo quando existe um cookie expirado.
    redirect('/login?reason=session_expired');
  }
  const state = await prisma.mobileState.findUnique({
    where: { user_id_key: { user_id: user.id, key: ONBOARDING_STATE_KEY } },
  });
  const preferences = parseOnboarding(state?.value);
  if (!preferences) redirect('/onboarding');

  // Só o conteúdo essencial bloqueia o primeiro paint. Duelos e atividade semanal
  // são carregados no cliente depois que o feed já está utilizável.
  const [feed, allBadges] = await Promise.all([
    PostService.getFeed(user.id, {
      limit: 10,
      filter: preferences.feed,
      languages: preferences.languages,
    }),
    prisma.badge.findMany({ orderBy: { slug: 'asc' } }),
  ]);
  const bookmarksMap: Record<string, boolean> = {};
  const earnedBadgeDates = new Map<string, string | null>(
    user.badges.map((userBadge: any): [string, string | null] => [
      userBadge.badge.slug,
      userBadge.earned_at?.toISOString() ?? null,
    ])
  );

  feed.items.forEach((post) => {
    if (post.bookmarks.length > 0) bookmarksMap[post.id] = true;
  });

  const serializedPosts = feed.items.map((post) => ({
    ...post,
    created_at: post.created_at.toISOString(),
  }));

  return (
    <FeedContent
      initialPreferences={preferences}
      initialCurrentDate={new Date().toISOString()}
      initialUser={{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        avatar_config: user.avatar_config,
        total_xp: user.total_xp,
        last_active_at: user.last_active_at?.toISOString() ?? null,
        streak: Math.max(
          user.streak_days,
          user.trails.reduce(
            (max: number, trail: { streak: number }) => Math.max(max, trail.streak),
            0
          )
        ),
        trails: [...user.trails].sort((a, b) => b.xp - a.xp),
        badges: allBadges.map((badge) => ({
          ...badge,
          earned_at: earnedBadgeDates.get(badge.slug) ?? null,
        })),
      }}
      initialPosts={serializedPosts}
      initialNextCursor={feed.nextCursor}
      initialBookmarks={bookmarksMap}
    />
  );
}
