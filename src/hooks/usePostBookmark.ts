'use client';

import { useEffect, useRef, useState } from 'react';
import {
  POST_BOOKMARK_CHANGED,
  readPostBookmark,
  writePostBookmark,
  type PostBookmarkChange,
} from '@/lib/client/post-bookmarks';

/** Replies share the saved state of their conversation's original post. */
export function usePostBookmark(postId: string | undefined, enabled: boolean) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const bookmarkLock = useRef(false);

  useEffect(() => {
    if (!postId || !enabled) return;
    let active = true;
    let changed = false;
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<PostBookmarkChange>).detail;
      if (detail.postId === postId) {
        changed = true;
        setIsBookmarked(detail.bookmarked);
      }
    };
    window.addEventListener(POST_BOOKMARK_CHANGED, onChange);
    void readPostBookmark(postId)
      .then((saved) => {
        if (active && !changed && !bookmarkLock.current) setIsBookmarked(saved);
      })
      .catch(() => {});
    return () => {
      active = false;
      window.removeEventListener(POST_BOOKMARK_CHANGED, onChange);
    };
  }, [postId, enabled]);

  const toggleBookmark = async () => {
    if (!postId || !enabled || bookmarkLock.current) return;
    bookmarkLock.current = true;
    setBookmarkPending(true);
    setBookmarkError(null);
    const previous = isBookmarked;
    setIsBookmarked(!previous);
    try {
      setIsBookmarked(await writePostBookmark(postId, !previous));
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
