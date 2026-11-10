'use client';

import { useTransform, type MotionValue } from 'framer-motion';
import { TrailsProgressSidebar } from '@/app/trails/TrailsProgressSidebar';
import { WORLD } from '@/lib/mundinho/world';
import { DemoShell } from '../DemoShell';
import { polylinePoint, useCounter, type Point } from '../demo-motion';
import { DEMO_AVATAR, DEMO_COURSES, DEMO_USER } from '../demo-data';
import { ramp, useBeats } from '../timeline';
import { MundinhoHome } from './trails/MundinhoHome';
import { MundinhoWorld } from './trails/MundinhoWorld';
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
  focusNode: 14.6,
  lesson: 16.2,
  option: 17.6,
  verify: 18.6,
  correct: 19.1,
  continue: 20.8,
  done: 21.3,
  focusBack: 22.2,
  mascotWalk: 22.8,
  mascotArrive: 24.4,
} as const;

/** The player crosses the clearing from the spawn point to Ada's cabin. */
export const WORLD_PATH: readonly Point[] = [WORLD.spawn, { x: 560, y: 345 }, { x: 640, y: 262 }];
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
  const totalXp = useCounter(
    clock,
    DEMO_USER.total_xp,
    DEMO_USER.total_xp + DEMO_USER.lesson_xp,
    TRAILS_MARKS.done,
    TRAILS_MARKS.done + 0.8
  );

  const walkProgress = useTransform(clock, (time) =>
    ramp(TRAILS_MARKS.walk, TRAILS_MARKS.arrived, time)
  );
  const worldX = useTransform(walkProgress, (p) => polylinePoint(WORLD_PATH, p).x);
  const worldY = useTransform(walkProgress, (p) => polylinePoint(WORLD_PATH, p).y);
  const walking = reached('walk') && !reached('arrived');
  const mascotProgress = useTransform(clock, (time) =>
    ramp(TRAILS_MARKS.mascotWalk, TRAILS_MARKS.mascotArrive, time)
  );

  const draft = {
    ...DEMO_AVATAR,
    hair: reached('hairPick') ? 2 : DEMO_AVATAR.hair,
    hairColor: reached('hairColor') ? 4 : DEMO_AVATAR.hairColor,
    outfit: reached('outfitPick') ? 1 : DEMO_AVATAR.outfit,
  };
  const category = reached('outfitTab') ? 'outfit' : reached('hairTab') ? 'hair' : 'skin';
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
            xpEarned: totalXp - DEMO_USER.total_xp,
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
          x={worldX}
          y={worldY}
          direction={reached('walk') ? 'right' : 'down'}
          walking={walking}
          atGuide={reached('arrived')}
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
        <TrailJourney
          key={completed ? 'after' : 'before'}
          thirdCompleted={completed}
          totalXp={totalXp}
          gems={DEMO_COINS}
          focusNode={completed ? reached('focusBack') : reached('focusNode')}
          mascotProgress={mascotProgress}
          mascotWalking={reached('mascotWalk') && !reached('mascotArrive')}
        />
      )}
    </DemoShell>
  );
}
