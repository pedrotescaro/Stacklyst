'use client';
import type { TrailLanguageCode } from '@/app/trails/TrailLanguageLogo';
import type { TrailCourseOption } from '@/app/trails/TrailCourseSelector';
import { FeedRightSidebar } from '@/components/FeedRightSidebar';
import { Sidebar } from '@/components/Sidebar';
import { MobileRankingBoard } from './MobileRankingBoard';
export interface LeaderboardRow {
  rank: number;
  username: string;
  avatar_url?: string | null;
  avatar_config?: unknown;
  xp: number;
  level: number;
  streak?: number;
  created_at?: string | null;
  status_emoji?: string | null;
}

interface LeaderboardClientProps {
  initialUser: {
    id: string;
    username: string;
    avatar_url?: string | null;
    avatar_config?: unknown;
    total_xp: number;
    trails?: unknown[];
    badges?: unknown[];
    streak?: number;
    last_active_at?: string | null;
  } | null;
  initialLeaderboard: LeaderboardRow[];
  initialGlobalLeaderboard?: LeaderboardRow[];
  initialLanguage?: TrailLanguageCode;
  courses?: TrailCourseOption[];
}

export function LeaderboardClient({
  initialUser,
  initialLeaderboard,
  initialGlobalLeaderboard,
  initialLanguage = 'JS',
}: LeaderboardClientProps) {
  return (
    <div className="dd-platform-shell dd-platform-shell--fullscreen">
      <Sidebar user={initialUser} />
      <div className="mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start">
        <main className="flex min-h-screen w-full min-w-0 max-w-[720px] flex-grow flex-col border-dd-border/60 bg-dd-bg pb-24 md:border-x md:pb-8 xl:max-w-[820px] 2xl:max-w-[920px]">
          <h1 className="sr-only">Ranking de XP</h1>
          <MobileRankingBoard
            initialLeaderboard={initialLeaderboard}
            initialGlobalLeaderboard={initialGlobalLeaderboard}
            initialLanguage={initialLanguage}
          />
        </main>
        <FeedRightSidebar user={initialUser} />
      </div>
    </div>
  );
}
