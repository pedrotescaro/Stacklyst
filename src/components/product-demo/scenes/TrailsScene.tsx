'use client';

import type { MotionValue } from 'framer-motion';
import { TrailsProgressSidebar } from '@/app/trails/TrailsProgressSidebar';
import { WORLD } from '@/lib/mundinho/world';
import { DemoShell } from '../DemoShell';
import { DEMO_AVATAR, DEMO_COURSES, DEMO_USER } from '../demo-data';
import { useBeats } from '../timeline';
import { MundinhoHome } from './trails/MundinhoHome';
import { MundinhoWorld, type WorldPose } from './trails/MundinhoWorld';
import { MundinhoAvatarEditor } from './trails/MundinhoAvatarEditor';
import { TrailJourney } from './trails/TrailJourney';
import { LessonBeat, type LessonStage } from './trails/LessonBeat';

const noop = () => {};

/** Beats of the Trails & Mundinho scene, in seconds. */
export const TRAILS_MARKS = {
  enterPressed: 2.6,
  world: 3.4,
  walk: 3.9,
  arrived: 6.0,
  dialogue: 6.3,
  avatar: 8.0,
  hairTab: 8.6,
  hairPick: 9.4,
  hairColor: 10.2,
  outfitTab: 11.0,
  outfitPick: 11.8,
  savePressed: 12.4,
  saved: 12.7,
  journey: 13.6,
  mascotWalk: 14.2,
  lesson: 16.2,
  option: 17.6,
  verify: 18.6,
  correct: 19.1,
  continue: 20.8,
  done: 21.3,
} as const;

/** Where the player stands next to Ada after walking across the clearing. */
export const WORLD_DESTINATION = { x: 640, y: 262 } as const;
const DEMO_COINS = 120;

export function TrailsScene({ clock, mobile }: { clock: MotionValue<number>; mobile: boolean }) {
  const reached = useBeats(clock, TRAILS_MARKS);
  const view = reached('journey')
    ? reached('lesson') && !reached('done')
      ? 'lesson'
      : 'journey'
    : reached('avatar')
      ? 'avatar'
      : reached('world')
        ? 'world'
        : 'home';
  const completed = reached('done');
  const totalXp = DEMO_USER.total_xp + (completed ? DEMO_USER.lesson_xp : 0);

  const draft = {
    ...DEMO_AVATAR,
    hair: reached('hairPick') ? 2 : DEMO_AVATAR.hair,
    hairColor: reached('hairColor') ? 4 : DEMO_AVATAR.hairColor,
    outfit: reached('outfitPick') ? 1 : DEMO_AVATAR.outfit,
  };
  const category = reached('outfitTab') ? 'outfit' : reached('hairTab') ? 'hair' : 'skin';
  const pose: WorldPose = reached('arrived')
    ? { ...WORLD_DESTINATION, direction: 'up', walking: false }
    : { ...WORLD.spawn, direction: 'down', walking: false };
  const stage: LessonStage = reached('correct')
    ? 'correct'
    : reached('verify')
      ? 'verifying'
      : reached('option')
        ? 'selected'
        : 'reading';

  if (view === 'lesson') return <LessonBeat stage={stage} />;

  return (
    <DemoShell
      route="trails"
      mobile={mobile}
      mobileHeader={false}
      shellClassName="adventure-platform"
      bodyClassName="dd-platform-body mx-auto flex w-full min-w-0 flex-grow xl:max-w-[1660px]"
      mainClassName="dd-platform-main min-w-0 flex-1 pb-20"
      rail={
        <TrailsProgressSidebar
          activeLanguage="JS"
          courses={[...DEMO_COURSES]}
          onSelectCourse={noop}
          totalXp={totalXp}
          gems={DEMO_COINS}
          streak={DEMO_USER.streak}
          lastActiveAt={DEMO_USER.last_active_at}
          globalRank={5}
          totalParticipants={128}
          username={DEMO_USER.username}
          avatarUrl={DEMO_USER.avatar_url}
          dailyProgress={{
            xpEarned: completed ? DEMO_USER.lesson_xp : 0,
            correctAnswers: completed ? 1 : 0,
            trailActivities: completed ? 1 : 0,
          }}
        />
      }
    >
      {view === 'home' && (
        <MundinhoHome
          avatar={DEMO_AVATAR}
          language="JS"
          coins={DEMO_COINS}
          streak={DEMO_USER.streak}
          totalXp={totalXp}
          courses={[
            { language: 'JS', completed: 2, total: 13 },
            { language: 'PYTHON', completed: 0, total: 13 },
          ]}
          enterPressed={reached('enterPressed')}
        />
      )}
      {view === 'world' && (
        <MundinhoWorld
          avatar={DEMO_AVATAR}
          username={DEMO_USER.username}
          playerLevel={4}
          pose={pose}
          dialogue={reached('dialogue')}
        />
      )}
      {view === 'avatar' && (
        <MundinhoAvatarEditor
          draft={draft}
          category={category}
          saved={reached('saved')}
          savePressed={reached('savePressed') && !reached('saved')}
        />
      )}
      {view === 'journey' && (
        <TrailJourney thirdCompleted={completed} totalXp={totalXp} gems={DEMO_COINS} />
      )}
    </DemoShell>
  );
}
