import { FeedRightSidebar } from '@/components/FeedRightSidebar';
import type { AchievementBadge } from '@/components/AchievementShowcase';

export interface ProfileRailUser {
  username: string;
  streak: number;
  last_active_at: string | null;
  trails: Array<{ id: string; language: string; xp: number; level: number }>;
  badges: AchievementBadge[];
}

/** The same personal progress and community rail used on the feed. */
export function ProfileRightRail({ user }: { user: ProfileRailUser }) {
  return <FeedRightSidebar user={user} />;
}
