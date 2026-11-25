import { loadPostDetail } from '@/lib/post-detail.server';
import { PostDetailContent } from './PostDetailContent';

export const revalidate = 0; // Desabilitar cache para dados dinâmicos de comentários/respostas

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, post, initialIsSaved } = await loadPostDetail(id);

  return <PostDetailContent user={user} post={post} initialIsSaved={initialIsSaved} />;
}
