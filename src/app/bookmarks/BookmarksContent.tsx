'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { PostCard } from '@/components/PostCard';
import { springGentle } from '@/lib/motion';
import { ArrowLeft, Search, Bookmark } from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface BookmarksContentProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
    total_xp: number;
  };
  initialPosts: any[];
}

export function BookmarksContent({ user, initialPosts }: BookmarksContentProps) {
  const router = useRouter();
  const { text } = useLocalizedText();
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar posts salvos com base na pesquisa
  const filteredPosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      post.title.toLowerCase().includes(query) ||
      post.body.toLowerCase().includes(query) ||
      post.author.username.toLowerCase().includes(query) ||
      (post.language && post.language.toLowerCase().includes(query))
    );
  });

  // Toggle salvar/remover bookmark com animação de saída (fade/exit)
  const handleBookmarkToggle = async (postId: string) => {
    // Remove do feed local imediatamente com saída suave
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      await fetch(`/api/posts/${postId}/bookmark`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      // Caso dê erro, re-adicionar o post
      const originalPost = initialPosts.find((p) => p.id === postId);
      if (originalPost) {
        setPosts((prev) => [originalPost, ...prev].sort((a, b) => b.id.localeCompare(a.id)));
      }
    }
  };

  return (
    <div className="dd-platform-shell">
      <Sidebar user={user} />

      <div className="mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start">
        <main className="flex min-h-screen w-full min-w-0 max-w-[720px] xl:max-w-[820px] 2xl:max-w-[920px] flex-grow flex-col border-r border-dd-border/80 bg-dd-bg pb-24 md:pb-8">
          {/* Header (Twitter style: Back arrow + Title + count) */}
          <div className="sticky top-0 z-30 bg-dd-bg/95 backdrop-blur-md border-b border-dd-border/60 px-4 py-3 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-dd-surface rounded-full transition-colors text-dd-text cursor-pointer"
              title={text('Voltar', 'Back')}
              aria-label={text('Voltar', 'Back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-dd-text text-base font-extrabold tracking-tight">
                {text('Itens salvos', 'Bookmarks')}
              </h1>
              <p className="text-dd-muted text-[10px] uppercase font-bold tracking-wider">
                {posts.length}{' '}
                {posts.length === 1
                  ? text('publicação salva', 'saved post')
                  : text('publicações salvas', 'saved posts')}
              </p>
            </div>
          </div>

          {/* Search bar (Twitter style) */}
          <div className="p-4 border-b border-dd-border/40">
            <div className="relative w-full">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dd-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text('Buscar itens salvos', 'Search bookmarks')}
                className="w-full pl-11 pr-4 py-2.5 bg-dd-surface/40 hover:bg-dd-surface/60 focus:bg-dd-surface/80 border border-dd-border/60 focus:border-blue-500/50 rounded-full text-xs text-dd-text placeholder-dd-muted outline-0 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Saved Posts Feed (exit/entrance animations) */}
          <div className="flex flex-col">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 px-6 bg-dd-surface/20 border border-dd-border border-dashed rounded-2xl space-y-4 max-w-md mx-auto mt-8">
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-dd-text">
                    {searchQuery.trim()
                      ? text('Nenhum resultado encontrado', 'No results found')
                      : text('Salvar publicações para depois', 'Save posts for later')}
                  </h3>
                  <p className="text-[11px] text-dd-muted leading-relaxed">
                    {searchQuery.trim()
                      ? text(
                          'Experimente buscar por outros termos de título, tags ou conteúdo.',
                          'Try searching for different titles, tags, or content.'
                        )
                      : text(
                          'Não deixe posts interessantes passarem! Salve-os em sua barra de ações para ler ou estudar com calma mais tarde.',
                          'Keep interesting posts close. Save them from the action bar to read or study later.'
                        )}
                  </p>
                </div>
              </div>
            ) : (
              <LayoutGroup>
                <AnimatePresence mode="popLayout">
                  {filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={springGentle}
                      className="border-b border-dd-border/50 last:border-b-0"
                    >
                      <PostCard
                        post={post}
                        isOwner={post.author.username === user.username}
                        flat={true}
                        onBookmarkToggle={(postId, isBookmarked) => {
                          if (!isBookmarked) {
                            handleBookmarkToggle(postId);
                          }
                        }}
                        onDelete={(postId) => {
                          setPosts((prev) => prev.filter((p) => p.id !== postId));
                        }}
                        onEdit={(postId, updatedPost) => {
                          setPosts((prev) =>
                            prev.map((p) => (p.id === postId ? { ...p, ...updatedPost } : p))
                          );
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </LayoutGroup>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
