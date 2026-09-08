import Image from 'next/image';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import {
  Home,
  BookOpen,
  Bell,
  Trophy,
  Swords,
  MessageCircle,
  Bookmark,
  User,
  MoreHorizontal,
} from 'lucide-react';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { DemoRightRail } from './DemoRightRail';

import { DemoCamera } from './DemoCamera';
import { DemoCursor } from './DemoCursor';

import { chapters, scenePresence, type SceneId } from './timeline';
import { FeedScene } from './scenes/FeedScene';
import { TrailsScene } from './scenes/TrailsScene';
import { DuelsScene } from './scenes/DuelsScene';
import { ProfileScene } from './scenes/ProfileScene';
import { RankingScene } from './scenes/RankingScene';
import type { ReactNode } from 'react';

const nav = [
  ['feed', 'Página Inicial', Home],
  ['trails', 'Trilhas', BookOpen],
  ['notifications', 'Notificações', Bell],
  ['ranking', 'Ranking', Trophy],
  ['duels', 'Duelos', Swords],
  ['messages', 'Bate-papo', MessageCircle],
  ['bookmarks', 'Itens salvos', Bookmark],
  ['profile', 'Perfil', User],
] as const;

function SceneLayer({
  id,
  time,
  children,
}: {
  id: SceneId;
  time: MotionValue<number>;
  children: ReactNode;
}) {
  const opacity = useTransform(time, (t) => scenePresence(id, t));
  const x = useTransform(opacity, (p) => (1 - p) * 42);
  const visibility = useTransform(opacity, (p) => (p < 0.001 ? 'hidden' : 'visible'));
  return (
    <motion.div className="demo-scene" data-demo-scene={id} style={{ opacity, x, visibility }}>
      {children}
    </motion.div>
  );
}
export function DemoViewport({
  time,
  width,
  active,
  duelPhase,
  reduced,
}: {
  time: MotionValue<number>;
  width: number;
  active: number;
  duelPhase: number;
  reduced: boolean;
}) {
  const mobile = width < 640;
  const base = mobile ? 640 : 1280;
  const scene = chapters[active]?.id ?? 'feed';
  return (
    <div
      className="demo-viewport"
      style={{ height: width ? (width / base) * (mobile ? 820 : 760) : undefined }}
    >
      <div
        className="demo-fit"
        style={{
          width: base,
          height: mobile ? 820 : 760,
          transform: `scale(${width ? width / base : 1})`,
        }}
      >
        <DemoCamera time={time} mobile={mobile}>
          <div className="demo-browser" inert aria-hidden="true">
            <div className={`demo-app ${mobile ? 'demo-app-mobile' : ''}`}>
              <aside className="demo-sidebar">
                <div className="demo-brand">
                  <Image src="/logo.svg" alt="" width={28} height={25} />
                  <strong>Stacklyst</strong>
                </div>
                <div className="demo-nav">
                  {nav.map(([id, label, Icon]) => (
                    <div key={id} data-active={scene === id}>
                      <Icon size={22} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="demo-sidebar-bottom">
                  <div className="flex items-center gap-4 p-3">
                    <MoreHorizontal size={22} />
                    <span>Mais</span>
                  </div>
                  <div className="demo-post-button">Postar</div>
                  <div className="mt-5 flex items-center gap-3">
                    <AuthorAvatar username="user" />
                    <span>
                      user
                      <br />
                      <small className="text-dd-muted">@user</small>
                    </span>
                  </div>
                </div>
              </aside>
              <div className="demo-content">
                <SceneLayer id="feed" time={time}>
                  <FeedScene time={time} />
                </SceneLayer>
                <SceneLayer id="trails" time={time}>
                  <TrailsScene time={time} />
                </SceneLayer>
                <SceneLayer id="duels" time={time}>
                  <DuelsScene phase={duelPhase} />
                </SceneLayer>
                <SceneLayer id="profile" time={time}>
                  <ProfileScene time={time} />
                </SceneLayer>
                <SceneLayer id="ranking" time={time}>
                  <RankingScene time={time} />
                </SceneLayer>
                {!reduced && <DemoCursor time={time} contentWidth={mobile ? 578 : 760} />}
              </div>
              <DemoRightRail scene={scene} />
            </div>
          </div>
        </DemoCamera>
      </div>
    </div>
  );
}
