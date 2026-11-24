'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
import { getLanguageLabel } from '@/components/LanguageTag';
import { calculateLevel } from '@/lib/learning/rewards';
import {
  continueStudyingHref,
  pickContinueTrail,
  type ContinueStudyingTrail,
} from '@/lib/learning/continue-studying';
import { useLocalizedText } from '@/i18n/useLocalizedText';

/**
 * Inline study shortcut for screens without the right rail (phones and tablets),
 * so the feed always has a one-tap route back into the learner's course.
 */
export function FeedContinueStudying({ trails }: { trails: readonly ContinueStudyingTrail[] }) {
  const { text } = useLocalizedText();
  const trail = pickContinueTrail(trails);
  const level = trail ? calculateLevel(trail.xp ?? 0).level : null;

  return (
    <Link
      href={continueStudyingHref(trails)}
      data-testid="feed-continue-studying"
      className="flex min-h-14 items-center gap-3 border-b border-dd-border px-4 py-3 transition-colors hover:bg-dd-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dd-accent xl:hidden"
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dd-accent text-black"
      >
        <BookOpen size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-dd-text">
          {trail
            ? text('Continuar estudando', 'Continue studying')
            : text('Comece sua primeira lição', 'Start your first lesson')}
        </span>
        {trail && (
          <span className="block text-xs text-dd-muted">
            {getLanguageLabel(trail.language)} · {text('Nível', 'Level')} {level}
          </span>
        )}
      </span>
      <ChevronRight size={20} className="shrink-0 text-dd-muted" aria-hidden="true" />
    </Link>
  );
}
