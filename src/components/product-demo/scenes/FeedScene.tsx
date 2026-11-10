'use client';

import type { MotionValue } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { FeedRankingSwitcher, feedRankingSurfaceClassName } from '@/components/FeedRankingSwitcher';
import { cn } from '@/lib/cn';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { DemoShell } from '../DemoShell';
import { DemoRightRail } from '../DemoRightRail';
import { DemoPost } from '../DemoPost';
import { DEMO_PEOPLE, DEMO_USER, demoCopy } from '../demo-data';
import { usePhase } from '../timeline';

/** Beats of the feed scene, in seconds: typing, publish, optimistic, settled, run, output, like. */
export const FEED_MARKS = [1, 3, 3.3, 4.5, 5.6, 6.2, 7.6] as const;

export function FeedScene({ clock, mobile }: { clock: MotionValue<number>; mobile: boolean }) {
  const { text } = useLocalizedText();
  const copy = demoCopy(text);
  const phase = usePhase(clock, FEED_MARKS);
  const typed = phase >= 1;
  const published = phase >= 3;

  return (
    <DemoShell
      route="feed"
      mobile={mobile}
      rail={<DemoRightRail trailXp={DEMO_USER.total_xp} />}
      mainClassName={cn(
        'dd-platform-main flex min-h-full w-full min-w-0 max-w-[720px] flex-grow flex-col border-dd-border/60 bg-dd-bg md:border-x xl:max-w-[820px] 2xl:max-w-[920px]',
        feedRankingSurfaceClassName
      )}
    >
      {/* FeedControls projection: switcher, feed tabs and the preferences trigger. */}
      <div className="relative z-30 min-w-0 border-b border-dd-border/60 bg-dd-bg px-3 py-3 md:sticky md:top-0">
        <div className="mb-2 flex items-center gap-2">
          <FeedRankingSwitcher active="feed" />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <div
            role="tablist"
            aria-label={text('Filtros do feed', 'Feed filters')}
            className="relative flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1"
          >
            <span
              role="tab"
              aria-selected="true"
              className="order-2 inline-flex min-h-11 items-center rounded-full border border-dd-accent bg-dd-accent px-4 text-xs font-bold text-white"
            >
              {text('Para você', 'For you')}
            </span>
            <span
              role="tab"
              aria-selected="false"
              className="order-1 inline-flex min-h-11 items-center rounded-full border border-dd-border px-4 text-xs font-bold text-dd-muted"
            >
              {text('Seguindo', 'Following')}
            </span>
          </div>
          <span
            aria-label={text('Personalizar feed', 'Customize feed')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dd-border text-dd-text"
          >
            <Pencil size={16} />
          </span>
        </div>
      </div>

      {/* Desktop composer trigger, exactly as the feed renders it. */}
      <div
        data-testid="desktop-feed-composer"
        className="hidden border-b border-dd-border px-5 py-5 md:block"
      >
        <div className="flex w-full items-center gap-3 text-left">
          <AuthorAvatar username={DEMO_USER.username} size="md" />
          <span
            className={cn('flex-1 text-lg', typed ? 'text-dd-text' : 'text-dd-muted')}
            data-testid="demo-composer-draft"
          >
            {typed ? copy.feed.draft : text('O que você está pensando?', "What's on your mind?")}
          </span>
          <span
            className="rounded-full bg-dd-accent px-5 py-2 text-sm font-semibold text-white"
            data-pressed={phase >= 2 && phase < 3}
          >
            {text('Criar postagem', 'Create post')}
          </span>
        </div>
        <p className="mt-3 pl-13 text-xs text-dd-muted">
          {text(
            'Compartilhe uma ideia, um código ou uma descoberta.',
            'Share an idea, code snippet, or insight.'
          )}
        </p>
      </div>

      <div className="flex flex-col">
        {published && (
          <DemoPost
            author={DEMO_USER}
            body={copy.feed.draft}
            createdLabel={text('Postado há pouco', 'Posted just now')}
            likes={0}
            optimistic={phase < 4}
          />
        )}
        <DemoPost
          author={{ ...DEMO_PEOPLE.bia, avatar_url: null }}
          body={copy.feed.snippetIntro}
          createdLabel={copy.feed.twoHoursAgo}
          code={{
            language: 'python',
            source: copy.feed.snippetCode,
            running: phase === 5,
            output: phase >= 6 ? copy.feed.snippetOutput : null,
          }}
          answers={2}
          reposts={1}
          likes={phase >= 7 ? 4 : 3}
          liked={phase >= 7}
        />
        <DemoPost
          author={{ ...DEMO_PEOPLE.leo, avatar_url: null }}
          body={copy.feed.duelPost}
          createdLabel={copy.feed.yesterday}
          answers={5}
          likes={12}
        />
      </div>
    </DemoShell>
  );
}
