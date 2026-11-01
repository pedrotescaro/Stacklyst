export const POST_BOOKMARK_CHANGED = 'stacklyst:bookmark-changed';
export interface PostBookmarkChange {
  postId: string;
  bookmarked: boolean;
}

const pendingReads = new Map<string, Promise<boolean>>();

export function readPostBookmark(postId: string) {
  let pending = pendingReads.get(postId);
  if (!pending) {
    pending = fetch(`/api/posts/${postId}/bookmark`, { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || typeof result.bookmarked !== 'boolean') {
          throw new Error(result.message || 'Não foi possível consultar os itens salvos.');
        }
        return result.bookmarked as boolean;
      })
      .finally(() => pendingReads.delete(postId));
    pendingReads.set(postId, pending);
  }
  return pending;
}

export async function writePostBookmark(postId: string, bookmarked: boolean) {
  const response = await fetch(`/api/posts/${postId}/bookmark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookmarked }),
  });
  const result = await response.json();
  if (!response.ok || typeof result.bookmarked !== 'boolean') {
    throw new Error(result.message || 'Não foi possível salvar a publicação. Tente novamente.');
  }
  window.dispatchEvent(
    new CustomEvent<PostBookmarkChange>(POST_BOOKMARK_CHANGED, {
      detail: { postId, bookmarked: result.bookmarked },
    })
  );
  return result.bookmarked as boolean;
}
