import { Search, Globe2, Code2, Braces, Shield } from 'lucide-react';
import { FeedEngagementCard } from '@/app/feed/FeedEngagementCard';
import { TrailsProgressSidebar } from '@/app/trails/TrailsProgressSidebar';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { demoTrails } from './demo-data';
import type { SceneId } from './timeline';
const activity = new Map([
  [0, 1],
  [1, 1],
]);
export function DemoRightRail({ scene }: { scene: SceneId }) {
  if (scene === 'duels') return <aside className="demo-right" />;
  if (scene === 'trails' || scene === 'profile')
    return (
      <aside className="demo-right demo-progress-rail">
        <TrailsProgressSidebar
          activeLanguage="JS"
          courses={[{ language: 'JS', xp: 1200, started: true }]}
          onSelectCourse={() => {}}
          totalXp={4250}
          streak={0}
          globalRank={1}
          totalParticipants={13}
          username="user"
          dailyProgress={{ xpEarned: 0, correctAnswers: 0, trailActivities: 0 }}
          variant={scene === 'trails' ? 'trails' : 'profile'}
          allowAddingCourses={false}
        />
      </aside>
    );
  if (scene === 'ranking')
    return (
      <aside className="demo-right">
        <div className="flex justify-between text-xs text-blue-400">
          <span>GLOBAL</span>
          <span>1º</span>
          <span>4.250 XP</span>
        </div>
        <section className="rounded-[22px] border-2 border-b-4 border-dd-border p-5">
          <h3 className="text-sm font-black">Escolha o ranking</h3>
          <div className="my-6 flex flex-col items-center gap-3">
            <AuthorAvatar username="user" className="!h-20 !w-20" />
            <strong>@user</strong>
            <span className="text-xs text-dd-muted">1º lugar · 4.250 XP</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              [Globe2, 'Global'],
              [Code2, 'JavaScript'],
              [Braces, 'Python'],
              [Shield, 'TypeScript'],
            ].map(([Icon, label]) => {
              const Glyph = Icon as typeof Globe2;
              return (
                <div
                  key={String(label)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-dd-border px-1 py-3 text-blue-400"
                >
                  <Glyph size={16} />
                  <span className="text-[7px] font-black">{String(label)}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-[10px] text-dd-muted">TODAS AS LINGUAGENS</p>
          <div className="mt-2 rounded-xl border border-dd-border p-3 text-xs">Global</div>
        </section>
      </aside>
    );
  return (
    <aside className="demo-right">
      <div className="demo-search">
        <Search size={16} />
        Buscar
      </div>
      <FeedEngagementCard
        streak={2}
        weeklyActivity={activity}
        lastActiveAt="2026-09-07T12:00:00Z"
        currentDate="2026-09-08T12:00:00Z"
      />
      <div className="rounded-[20px] border-2 border-dd-border p-5">
        <h3 className="font-black">Minhas Trilhas</h3>
        <p className="mt-1 text-xs text-dd-muted">Seu progresso por linguagem</p>
        {demoTrails.map((trail, i) => (
          <div key={trail.language} className="mt-5">
            <div className="mb-2 flex justify-between text-xs">
              <span>{['TypeScript', 'JavaScript', 'Python'][i]}</span>
              <span className="text-blue-400">Lvl {trail.level}</span>
            </div>
            <div className="demo-progress">
              <div style={{ transform: `scaleX(${0.72 - i * 0.12})` }} />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
