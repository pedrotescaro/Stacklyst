'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { AdventureHub } from '@/components/mundinho/AdventureHub';
import { TrailsProgressSidebar } from './TrailsProgressSidebar';
import type { AdventureTransport, Course } from '@/lib/mundinho/types';
import type { TrailCourseOption } from './TrailCourseSelector';
import type { TrailLanguageCode } from './TrailLanguageLogo';
import type { TrailDailyProgress } from './TrailsProgressSidebar';

interface AdventureEntryProps {
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    total_xp: number;
    streak?: number;
    last_active_at?: string | null;
  };
  courses: Course[];
  initialCourses: TrailCourseOption[];
  initialActiveLanguage: TrailLanguageCode;
  coins: number;
  globalRank: number;
  totalParticipants: number;
  dailyProgress: TrailDailyProgress;
}

export function AdventureEntry({
  user,
  courses,
  initialCourses,
  initialActiveLanguage,
  coins,
  globalRank,
  totalParticipants,
  dailyProgress,
}: AdventureEntryProps) {
  const router = useRouter();
  const [activeLanguage, setActiveLanguage] = useState<TrailLanguageCode>(initialActiveLanguage);
  const [currentCoins, setCurrentCoins] = useState(coins);

  const transport: AdventureTransport = useCallback(async (action) => {
    const response = await fetch('/api/mundinho', {
      method: action ? 'POST' : 'GET',
      headers: action ? { 'Content-Type': 'application/json' } : undefined,
      body: action ? JSON.stringify(action) : undefined,
      cache: 'no-store',
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.message ?? 'Não foi possível carregar o Mundinho. Tente novamente.');
    }
    if (typeof body.coins === 'number') {
      setCurrentCoins(body.coins);
    }
    return body;
  }, []);

  return (
    <div className="dd-platform-shell adventure-platform relative min-h-screen bg-dd-bg">
      <Sidebar user={user} />
      <div className="mx-auto flex w-full min-w-0 flex-grow xl:max-w-[1660px]">
        {/* Main Mundinho Area - Sits right adjacent to Sidebar divider */}
        <main className="min-w-0 flex-1 pb-20">
          <AdventureHub
            transport={transport}
            courses={courses}
            onCourse={(language) =>
              router.push(
                `/trails?view=map${language ? `&language=${encodeURIComponent(language)}` : ''}`
              )
            }
          />
        </main>

        {/* Right Sidebar Rail with Divider (Ranking + Missões do dia + Resource bar) */}
        <TrailsProgressSidebar
          activeLanguage={activeLanguage}
          courses={initialCourses}
          onSelectCourse={(lang) => {
            setActiveLanguage(lang);
            router.push(`/trails?view=map&language=${encodeURIComponent(lang)}`);
          }}
          totalXp={user.total_xp}
          gems={currentCoins}
          streak={user.streak ?? 0}
          lastActiveAt={user.last_active_at}
          globalRank={globalRank}
          totalParticipants={totalParticipants}
          username={user.username}
          avatarUrl={user.avatar_url}
          dailyProgress={dailyProgress}
        />
      </div>
    </div>
  );
}
