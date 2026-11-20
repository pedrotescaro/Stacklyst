'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { postActionClassName } from '@/components/PostActionsBar';
import { useLocalizedText } from '@/i18n/useLocalizedText';

/**
 * Share action that behaves like the one on posts: the native share sheet on
 * phones, otherwise the link is copied, the icon turns into a check and a
 * "Link copiado!" bubble shows above it for two seconds.
 */
export function ShareLinkButton({
  path,
  label,
  shareTitle,
  shareText,
}: {
  /** Path on this site, e.g. `/post/1#answer-2`. */
  path: string;
  label: string;
  shareTitle?: string;
  shareText?: string;
}) {
  const { text } = useLocalizedText();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  async function share() {
    const url = `${window.location.origin}${path}`;
    if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title: shareTitle || 'Stacklyst', text: shareText, url });
        return;
      } catch {
        // Fall back to copying the link.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy share link:', error);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          void share();
        }}
        className={postActionClassName}
        title={label}
        aria-label={label}
      >
        {copied ? (
          <Check className="text-emerald-400" aria-hidden="true" />
        ) : (
          <Share2 aria-hidden="true" />
        )}
      </button>
      {copied && (
        <div
          role="status"
          className="absolute bottom-full right-0 z-50 mb-2 whitespace-nowrap rounded-lg border border-dd-border bg-dd-surface px-2.5 py-1 text-[10px] font-bold text-dd-text shadow-xl animate-slide-up"
        >
          {text('Link copiado!', 'Link copied!')}
        </div>
      )}
    </div>
  );
}
