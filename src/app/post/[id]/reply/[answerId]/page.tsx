import { loadPostDetail } from '@/lib/post-detail.server';
import { PostDetailContent } from '../../PostDetailContent';

export const revalidate = 0; // Desabilitar cache para dados dinâmicos de comentários/respostas

export default async function ReplyDetailPage({
  params,
}: {
  params: Promise<{ id: string; answerId: string }>;
}) {
  const { id, answerId } = await params;
  const { user, post, initialIsSaved } = await loadPostDetail(id, answerId);

  return (
    <PostDetailContent
      user={user}
      post={post}
      initialIsSaved={initialIsSaved}
      focusedAnswerId={answerId}
    />
  );
}
