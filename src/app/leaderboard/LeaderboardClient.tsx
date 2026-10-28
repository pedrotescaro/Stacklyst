'use client';
import type { TrailLanguageCode } from '@/app/trails/TrailLanguageLogo';
import type { TrailCourseOption } from '@/app/trails/TrailCourseSelector';
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
      <main className="mx-auto min-w-0 w-full max-w-[760px] flex-1 pb-24">
        <h1 className="sr-only">Ranking de XP</h1>
        <MobileRankingBoard
          initialLeaderboard={initialLeaderboard}
          initialGlobalLeaderboard={initialGlobalLeaderboard}
          initialLanguage={initialLanguage}
        />
      </main>
    </div>
  );
}
