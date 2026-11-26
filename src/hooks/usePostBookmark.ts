'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ANSWER_BOOKMARK_CHANGED,
  POST_BOOKMARK_CHANGED,
  readAnswerBookmark,
  readPostBookmark,
  writeAnswerBookmark,
  writePostBookmark,
  type AnswerBookmarkChange,
  type PostBookmarkChange,
} from '@/lib/client/post-bookmarks';

interface BookmarkTarget {
  event: string;
  matches: (detail: unknown, id: string) => boolean;
  read: (id: string) => Promise<boolean>;
  write: (id: string, bookmarked: boolean) => Promise<boolean>;
}

const POST_TARGET: BookmarkTarget = {
  event: POST_BOOKMARK_CHANGED,
  matches: (detail, id) => (detail as PostBookmarkChange).postId === id,
  read: readPostBookmark,
  write: writePostBookmark,
};

const ANSWER_TARGET: BookmarkTarget = {
  event: ANSWER_BOOKMARK_CHANGED,
  matches: (detail, id) => (detail as AnswerBookmarkChange).answerId === id,
  read: readAnswerBookmark,
  write: writeAnswerBookmark,
};

function useBookmark(target: BookmarkTarget, id: string | undefined, enabled: boolean) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const bookmarkLock = useRef(false);

  useEffect(() => {
    if (!id || !enabled) return;
    let active = true;
    let changed = false;
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent).detail as { bookmarked: boolean };
      if (target.matches(detail, id)) {
        changed = true;
        setIsBookmarked(detail.bookmarked);
      }
    };
    window.addEventListener(target.event, onChange);
    void target
      .read(id)
      .then((saved) => {
        if (active && !changed && !bookmarkLock.current) setIsBookmarked(saved);
      })
      .catch(() => {});
    return () => {
      active = false;
      window.removeEventListener(target.event, onChange);
    };
  }, [target, id, enabled]);

  const toggleBookmark = async () => {
    if (!id || !enabled || bookmarkLock.current) return;
    bookmarkLock.current = true;
    setBookmarkPending(true);
    setBookmarkError(null);
    const previous = isBookmarked;
    setIsBookmarked(!previous);
    try {
      setIsBookmarked(await target.write(id, !previous));
    } catch (error) {
      setIsBookmarked(previous);
      setBookmarkError(error instanceof Error ? error.message : 'Não foi possível salvar.');
    } finally {
      bookmarkLock.current = false;
      setBookmarkPending(false);
    }
  };

  return { isBookmarked, bookmarkPending, bookmarkError, toggleBookmark };
}

export function usePostBookmark(postId: string | undefined, enabled: boolean) {
  return useBookmark(POST_TARGET, postId, enabled);
}

/** Each reply has its own saved state, so saving one never saves the rest of the thread. */
export function useAnswerBookmark(answerId: string | undefined, enabled: boolean) {
  return useBookmark(ANSWER_TARGET, answerId, enabled);
}
