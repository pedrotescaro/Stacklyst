import { clearPageCache } from './page-cache';

export const POST_PIN_CHANGED = 'stacklyst:post-pin-changed';

export interface PostPinChange {
  postId: string;
  pinned: boolean;
}

/**
 * Persists whether a post is pinned as the author's main profile post.
 * Clears cached profile lists so navigating back shows the updated pin order.
 */
export async function writePostPin(postId: string, pinned: boolean): Promise<boolean> {
  const response = await fetch(`/api/posts/${encodeURIComponent(postId)}/pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pinned }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload.pinned !== 'boolean') {
    throw new Error(
      (typeof payload?.message === 'string' && payload.message) ||
        (typeof payload?.error === 'string' && payload.error) ||
        'Não foi possível fixar este post no perfil.'
    );
  }
  clearPageCache();
  window.dispatchEvent(
    new CustomEvent<PostPinChange>(POST_PIN_CHANGED, {
      detail: { postId, pinned: payload.pinned },
    })
  );
  return payload.pinned;
}
