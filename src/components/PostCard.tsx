/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LanguageTag } from './LanguageTag';
import {
  Flag,
  Heart,
  MessageCircle,
  BarChart2,
  Trash2,
  MoreHorizontal,
  Pencil,
  X,
  Share2,
  Check,
} from 'lucide-react';
import { LikeButton } from './motion/LikeButton';
import { BookmarkButton } from './motion/BookmarkButton';
import { RepostMenu } from './motion/RepostMenu';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { LevelBadge } from '@/components/LevelBadge';
import { MarkdownRenderer } from './MarkdownRenderer';
import { PostLocation, SensitiveContentGate } from './PostPresentation';
import { cn } from '@/lib/cn';
import { useHydrationSafeRelativeTime } from '@/hooks/useHydrationSafeRelativeTime';
import { ComposeModal } from '@/components/motion/ComposeModal';
import { MarkdownEditor, type NotionEditorRef } from '@/components/MarkdownEditor';
import { CharCounter } from '@/components/motion/CharCounter';
import { POST_CHAR_LIMIT } from '@/lib/motion';
import { parsePostExtras } from '@/lib/post-composer';
import { prismaLanguageToEditor } from '@/lib/editor/languages';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface PostAuthor {
  name?: string | null;
  username: string;
  avatar_url?: string | null;
  avatar_config?: unknown;
  total_xp?: number;
}

interface Post {
  id: string;
  title: string;
  body: string;
  language?: string | null;
  code_snippet?: string | null;
  image_url?: string | null;
  created_at: string;
  view_count: number;
  author: PostAuthor;
  _count: {
    answers: number;
  };
  votes?: Array<{ value: number }>;
  bookmarks?: Array<{ id: string }>;
  reactions?: Array<{ type: string }>;
  upvotes?: number;
  quizzes?: any[];
}

interface PostCardProps {
  post: Post;
  isOwner?: boolean;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string, updatedPost: any) => void;
  flat?: boolean;
  onBookmarkToggle?: (postId: string, bookmarked: boolean) => void;
}

function createSnippetMarkdown(code: string, language?: string | null) {
  const fenceLength = Math.max(3, ...[...code.matchAll(/`+/g)].map((match) => match[0].length + 1));
  const fence = '`'.repeat(fenceLength);
  const snippetLanguage = language ? prismaLanguageToEditor(language) : 'text-static';
  return `${fence}${snippetLanguage}\n${code.replace(/\n?$/, '\n')}${fence}`;
}

export function PostCard({
  post,
  isOwner = false,
  onDelete,
  onEdit,
  flat = false,
  onBookmarkToggle,
}: PostCardProps) {
  const router = useRouter();
  const { text } = useLocalizedText();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Stateful copy of post fields for instant local updates
  const [postBody, setPostBody] = useState(post.body);
  const [postLanguage, setPostLanguage] = useState(post.language);
  const [postCodeSnippet, setPostCodeSnippet] = useState(post.code_snippet);
  const [editBody, setEditBody] = useState(post.body);

  const menuRef = useRef<HTMLDivElement>(null);
  const editBodyEditorRef = useRef<NotionEditorRef>(null);

  useEffect(() => {
    setPostBody(post.body);
    setPostLanguage(post.language);
    setPostCodeSnippet(post.code_snippet);
    setEditBody(post.body);
  }, [post.body, post.language, post.code_snippet]);

  // Click outside to close the dropdown menu
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('select') ||
      target.closest('input') ||
      target.closest('textarea') ||
      window.getSelection()?.toString()
    ) {
      return;
    }
    router.push(`/post/${post.id}`);
  };

  // Estados interativos locais
  const EMOJI_TO_TYPE: Record<string, string> = {
    '🔥': 'FIRE',
    '❤️': 'HEART',
    '😂': 'LAUGH',
    '👏': 'CLAP',
    '💡': 'BULB',
  };

  const TYPE_TO_EMOJI: Record<string, string> = {
    FIRE: '🔥',
    HEART: '❤️',
    LAUGH: '😂',
    CLAP: '👏',
    BULB: '💡',
  };

  const getInitialLikeState = () => {
    if (post.votes && post.votes.length > 0 && post.votes[0].value === 1) {
      return true;
    }
    return false;
  };

  const initialLiked = getInitialLikeState();
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likesCount, setLikesCount] = useState(post.upvotes ?? 0);
  const [bookmarked, setBookmarked] = useState<boolean>(
    !!(post.bookmarks && post.bookmarks.length > 0)
  );
  const [repostsCount, setRepostsCount] = useState(0);
  const [reposted, setReposted] = useState(false);

  const handleLikeToggle = async () => {
    const nextLiked = !liked;
    const newValue = nextLiked ? 1 : 0;
    const previousLiked = liked;
    const previousCount = likesCount;

    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?reason=session_expired');
          return;
        }
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.message || 'Falha ao registrar curtida');
      }

      const data = await res.json();
      setLikesCount(data.upvotes);
    } catch (err) {
      console.error(err);
      setLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleBookmarkToggle = async () => {
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    onBookmarkToggle?.(post.id, newBookmarked);

    try {
      const res = await fetch(`/api/posts/${post.id}/bookmark`, {
        method: 'POST',
      });

      if (!res.ok) {
        setBookmarked(!newBookmarked);
        onBookmarkToggle?.(post.id, !newBookmarked);
      }
    } catch {
      setBookmarked(!newBookmarked);
      onBookmarkToggle?.(post.id, !newBookmarked);
    }
  };

  const handleRepostToggle = () => {
    const newReposted = !reposted;
    setReposted(newReposted);
    setRepostsCount((prev) => (newReposted ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setReporting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      if (res.ok) {
        setReported(true);
        setTimeout(() => {
          setReportModalOpen(false);
          setReported(false);
          setReportReason('');
        }, 1500);
      } else {
        alert(text('Falha ao enviar denúncia.', 'Could not send report.'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        onDelete?.(post.id);
      } else {
        alert('Falha ao deletar post.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar post.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBody.trim() || editBody.trim().length < 10) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editBody.trim() }),
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setEditModalOpen(false);
        setPostBody(updatedPost.body);
        setPostLanguage(updatedPost.language);
        setPostCodeSnippet(updatedPost.code_snippet);
        onEdit?.(post.id, updatedPost);
      } else {
        const data = await res.json();
        alert(data.error || 'Falha ao editar post.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao editar post.');
    } finally {
      setSaving(false);
    }
  };

  const presentedPost = parsePostExtras(postBody);
  const snippetMarkdown = postCodeSnippet
    ? createSnippetMarkdown(postCodeSnippet, postLanguage)
    : null;
  const { text: relativeTime, isRelative } = useHydrationSafeRelativeTime(post.created_at);

  return (
    <div onClick={handleCardClick} className="block min-w-0 group cursor-pointer">
      <article
        className={cn(
          'relative min-w-0 transition-colors',
          flat
            ? 'rounded-none border-b border-dd-border/50 bg-transparent p-3 sm:p-4 lg:p-5 hover:bg-dd-surface/20'
            : 'bg-dd-card border border-dd-border rounded-xl p-5 hover:border-blue-500/30'
        )}
      >
        {/* Header */}
        <div className="mb-2.5 flex items-center gap-2 sm:mb-3 sm:gap-3">
          <Link
            href={`/profile/${post.author.username}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:opacity-85 transition-opacity shrink-0"
          >
            <AuthorAvatar
              username={post.author.username}
              avatar_url={post.author.avatar_url}
              avatar_config={post.author.avatar_config}
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                href={`/profile/${post.author.username}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 hover:underline truncate group/author min-w-0"
              >
                <span className="text-dd-text text-xs font-bold truncate min-w-0 group-hover/author:underline">
                  {post.author.name || post.author.username}
                </span>
                <span className="text-dd-muted text-[11px] font-medium truncate min-w-0">
                  @{post.author.username.toLowerCase()}
                </span>
              </Link>
              <LevelBadge totalXp={post.author.total_xp ?? 0} />
            </div>
            <span className="text-dd-muted text-[10px] block mt-0.5 font-medium">
              {isRelative && relativeTime === 'agora'
                ? text('Postado há pouco', 'Posted just now')
                : `Postado ${relativeTime}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
            {postLanguage && <LanguageTag language={postLanguage} size="sm" />}
          </div>
        </div>

        <SensitiveContentGate isSensitive={presentedPost.isSensitive}>
          {/* Body preview */}
          <div className="mb-3 text-dd-muted">
            <MarkdownRenderer content={presentedPost.content} compact />
          </div>

          {/* Image preview */}
          {post.image_url && (
            <div className="mt-3 mb-3 relative rounded-xl overflow-hidden border border-dd-border max-h-80 bg-dd-surface/20">
              <Image
                src={post.image_url}
                alt={`Post de @${post.author.username}`}
                width={800}
                height={320}
                className="w-full h-full object-cover max-h-80"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Code snippet preview */}
          {snippetMarkdown && !presentedPost.content.includes('```') && (
            <MarkdownRenderer content={snippetMarkdown} compact />
          )}
        </SensitiveContentGate>

        <PostLocation location={presentedPost.location} className="mb-3" />

        {/* Footer: Action bar (Twitter style) */}
        <div
          className="flex items-center justify-between pt-2.5 mt-2 border-t border-dd-border/60 text-xs w-full select-none text-dd-muted max-w-full"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {/* 1. Comment bubble */}
          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1 text-dd-muted hover:text-blue-400 transition-colors group/comment -ml-1 py-1 px-1"
            title={text('Responder', 'Reply')}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover/comment:bg-blue-500/10 transition-colors shrink-0">
              <MessageCircle className="w-[18px] h-[18px] text-dd-muted group-hover/comment:text-blue-400" />
            </div>
            {(post._count?.answers ?? 0) > 0 && (
              <span className="px-0.5 text-xs text-dd-muted group-hover/comment:text-blue-400">
                {post._count?.answers}
              </span>
            )}
          </Link>

          {/* 2. Repost Menu */}
          <RepostMenu
            count={repostsCount}
            isReposted={reposted}
            onRepost={handleRepostToggle}
            onQuote={() => {}}
          />

          {/* 3. Heart/Like button */}
          <LikeButton
            count={likesCount}
            isActive={liked}
            onToggle={handleLikeToggle}
            title={text('Curtir post', 'Like post')}
          />

          {/* Right cluster: Bookmark, Share, More (...) */}
          <div className="flex items-center gap-1 -mr-1">
            {/* 4. BookmarkButton */}
            <BookmarkButton isSaved={bookmarked} onToggle={handleBookmarkToggle} />

            {/* 5. Share Button */}
            <div className="relative">
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const url =
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/post/${post.id}`
                      : `/post/${post.id}`;
                  if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
                    try {
                      await navigator.share({
                        title: post.title || 'Stacklyst Post',
                        text: post.body.substring(0, 100),
                        url,
                      });
                      return;
                    } catch {
                      // fallback to clipboard
                    }
                  }
                  try {
                    await navigator.clipboard.writeText(url);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                  } catch (err) {
                    console.error('Failed to copy share link:', err);
                  }
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-dd-muted hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer shrink-0"
                title={text('Compartilhar post', 'Share post')}
              >
                {shareCopied ? (
                  <Check className="w-[18px] h-[18px] text-emerald-400" />
                ) : (
                  <Share2 className="w-[18px] h-[18px]" />
                )}
              </button>
              {shareCopied && (
                <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-dd-surface border border-dd-border text-dd-text text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl animate-slide-up z-50">
                  Link copiado!
                </div>
              )}
            </div>

            {/* 6. More Options (...) */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setMenuOpen(!menuOpen);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-dd-muted hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer shrink-0"
                title={text('Mais opções', 'More options')}
              >
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 bottom-full mb-1.5 w-44 rounded-2xl border border-dd-border/80 bg-dd-surface p-1.5 shadow-2xl z-40 animate-slide-up"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  {isOwner ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setEditModalOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-dd-text hover:bg-dd-bg transition-colors cursor-pointer text-left"
                      >
                        <Pencil className="w-4 h-4 text-dd-muted" />
                        <span>{text('Editar', 'Edit')}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setDeleteModalOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <span>{text('Excluir', 'Delete')}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setReportModalOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-dd-text hover:bg-dd-bg transition-colors cursor-pointer text-left"
                    >
                      <Flag className="w-4 h-4 text-dd-muted" />
                      <span>Denunciar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      {reportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setReportModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`report-post-title-${post.id}`}
            className="w-full max-w-md bg-dd-surface border border-dd-border rounded-2xl p-5 space-y-4 text-left relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id={`report-post-title-${post.id}`} className="text-sm font-black text-dd-text">
              {text('Denunciar postagem', 'Report post')}
            </h3>
            <p className="text-xs text-dd-muted font-semibold leading-relaxed">
              {text(
                'Ajude-nos a entender o que há de errado com esta postagem. Ela viola alguma de nossas diretrizes de comunidade?',
                'Help us understand what is wrong with this post. Does it violate our community guidelines?'
              )}
            </p>

            {reported ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-3 rounded-lg text-center animate-pulse">
                {text(
                  'Denúncia enviada com sucesso. Obrigado por ajudar!',
                  'Report sent. Thanks for helping!'
                )}
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-dd-muted font-bold uppercase tracking-wider block">
                    {text('Motivo da denúncia', 'Report reason')}
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    className="w-full text-xs rounded-lg border border-dd-border bg-dd-bg px-3 py-2.5 text-dd-text focus:border-red-500/50 focus:outline-none"
                  >
                    <option value="">Selecione um motivo...</option>
                    <option value="Spam / Propaganda enganosa">Spam / Propaganda enganosa</option>
                    <option value="Discurso de ódio / Ofensa">Discurso de ódio / Ofensa</option>
                    <option value="Assédio / Bullying">Assédio / Bullying</option>
                    <option value="Código / Conteúdo malicioso ou perigoso">
                      Código / Conteúdo malicioso ou perigoso
                    </option>
                    <option value="Outro motivo">Outro motivo</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-dd-border">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setReportModalOpen(false);
                    }}
                    className="text-xs font-bold text-dd-muted hover:text-dd-text py-2 px-4 rounded-lg hover:bg-dd-surface transition-all cursor-pointer"
                  >
                    {text('Cancelar', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => e.stopPropagation()}
                    disabled={reporting || !reportReason}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {reporting ? text('Enviando...', 'Sending...') : text('Denunciar', 'Report')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setDeleteModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-post-title-${post.id}`}
            className="w-full max-w-md bg-dd-surface border border-dd-border rounded-2xl p-5 space-y-4 text-left relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id={`delete-post-title-${post.id}`} className="text-sm font-black text-dd-text">
              {text('Deletar postagem', 'Delete post')}
            </h3>
            <p className="text-xs text-dd-muted font-semibold leading-relaxed">
              {text(
                'Tem certeza que deseja deletar esta postagem? Esta ação não pode ser desfeita.',
                'Are you sure you want to delete this post? This action cannot be undone.'
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-dd-border">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDeleteModalOpen(false);
                }}
                className="text-xs font-bold text-dd-muted hover:text-dd-text py-2 px-4 rounded-lg hover:bg-dd-surface transition-all cursor-pointer"
              >
                {text('Cancelar', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? text('Deletando...', 'Deleting...') : text('Deletar', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT POST MODAL */}
      <ComposeModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        hasDraft={editBody !== postBody}
        onDiscard={() => setEditBody(postBody)}
      >
        <form
          onSubmit={handleEditSubmit}
          className="space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-3">
            <AuthorAvatar
              username={post.author.username}
              avatar_url={post.author.avatar_url}
              avatar_config={post.author.avatar_config}
            />

            <div className="flex-grow min-w-0 space-y-3 relative">
              <h3 className="text-sm font-black text-dd-text">
                {text('Editar publicação', 'Edit post')}
              </h3>
              <MarkdownEditor
                ref={editBodyEditorRef}
                value={editBody}
                onChange={(val) => setEditBody(val)}
                maxLength={POST_CHAR_LIMIT}
                minHeight="8rem"
                placeholder={text('Editar conteúdo...', 'Edit content...')}
              />
              <div className="flex justify-end">
                <CharCounter text={editBody} limit={POST_CHAR_LIMIT} />
              </div>
            </div>
          </div>

          <div className="border-t border-dd-border/50 pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setEditModalOpen(false);
              }}
              className="text-xs font-bold text-dd-muted hover:text-dd-text py-2 px-4 rounded-lg hover:bg-dd-surface transition-all cursor-pointer"
            >
              {text('Cancelar', 'Cancel')}
            </button>
            <button
              type="submit"
              onClick={(e) => e.stopPropagation()}
              disabled={saving || !editBody.trim() || editBody.length >= POST_CHAR_LIMIT}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors cursor-pointer"
            >
              {saving ? text('Salvando...', 'Saving...') : text('Salvar', 'Save')}
            </button>
          </div>
        </form>
      </ComposeModal>
    </div>
  );
}
