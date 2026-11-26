'use client';

import { PostOptionsMenu, type PostBodyUpdate } from '@/components/posts/PostOptionsMenu';
import { ReplyOwnerMenu } from '@/components/replies/ReplyOwnerMenu';
import { usePostPin } from '@/hooks/usePostPin';

interface ThreadItemAuthor {
  id?: string;
  username: string;
  avatar_url?: string | null;
  avatar_config?: unknown;
}

function ThreadPostMenu({
  post,
  isOwner,
  onDeleted,
  onUpdated,
}: {
  post: {
    id: string;
    body: string;
    author_id?: string;
    is_pinned?: boolean;
    author: ThreadItemAuthor;
  };
  isOwner: boolean;
  onDeleted?: () => void;
  onUpdated?: (update: PostBodyUpdate) => void;
}) {
  const { pinned, pinPending, togglePin } = usePostPin(post.id, Boolean(post.is_pinned), isOwner);
  return (
    <PostOptionsMenu
      post={post}
      isOwner={isOwner}
      pinned={pinned}
      pinPending={pinPending}
      onTogglePin={() => void togglePin()}
      onDeleted={onDeleted}
      onUpdated={onUpdated}
    />
  );
}

/**
 * The top-right "..." of a post or reply shown as thread context, so every item
 * above a reply can be pinned, edited or deleted from where it is.
 */
export function ThreadItemMenu(
  props:
    | {
        kind: 'post';
        item: {
          id: string;
          body: string;
          author_id?: string;
          is_pinned?: boolean;
          author: ThreadItemAuthor;
        };
        viewerId?: string | null;
        onDeleted?: () => void;
        onUpdated?: (update: PostBodyUpdate) => void;
      }
    | {
        kind: 'reply';
        item: { id: string; author_id?: string; author: ThreadItemAuthor };
        viewerId?: string | null;
        onEdit: () => void;
        onDeleted: () => void;
      }
) {
  if (!props.viewerId) return null;
  const authorId = props.item.author_id ?? props.item.author.id;
  const isOwner = Boolean(authorId && authorId === props.viewerId);
  if (props.kind === 'post') {
    return (
      <ThreadPostMenu
        post={props.item}
        isOwner={isOwner}
        onDeleted={props.onDeleted}
        onUpdated={props.onUpdated}
      />
    );
  }
  if (!isOwner) return null;
  return (
    <ReplyOwnerMenu
      answerId={props.item.id}
      placement="down"
      onEdit={props.onEdit}
      onDeleted={props.onDeleted}
    />
  );
}
