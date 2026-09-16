import { Screen } from '~/components/ui';
import { RemoteList } from '~/components/remote';
import { PostCard } from '~/features/feed/PostCard';
import { Post } from '~/lib/types';
export default function Bookmarks() {
  return (
    <Screen title="Itens salvos" back scroll={false}>
      <RemoteList<Post> path="/api/mobile/bookmarks" render={(p) => <PostCard post={p} />} />
    </Screen>
  );
}
