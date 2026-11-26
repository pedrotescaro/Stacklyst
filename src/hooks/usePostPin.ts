'use client';

import { useEffect, useRef, useState } from 'react';
import { POST_PIN_CHANGED, writePostPin, type PostPinChange } from '@/lib/client/post-pins';

/**
 * Pinned state of one post, kept in sync with every other surface showing it.
 * Pinning a post unpins the owner's previous one, so other pins of theirs reset.
 */
export function usePostPin(postId: string, initialPinned: boolean, isOwner: boolean) {
  const [pinned, setPinned] = useState(initialPinned);
  const [pinPending, setPinPending] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    if (!lock.current) setPinned(initialPinned);
  }, [initialPinned]);

  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<PostPinChange>).detail;
      if (detail.postId === postId) setPinned(detail.pinned);
      else if (detail.pinned && isOwner) setPinned(false);
    };
    window.addEventListener(POST_PIN_CHANGED, onChange);
    return () => window.removeEventListener(POST_PIN_CHANGED, onChange);
  }, [postId, isOwner]);

  const togglePin = async () => {
    if (lock.current || !isOwner) return;
    lock.current = true;
    setPinPending(true);
    const previous = pinned;
    setPinned(!previous);
    try {
      setPinned(await writePostPin(postId, !previous));
    } catch {
      setPinned(previous);
    } finally {
      lock.current = false;
      setPinPending(false);
    }
  };

  return { pinned, pinPending, togglePin };
}
