'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { UsersRound } from 'lucide-react';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { ProfileFlag } from '@/components/profile/ProfileIdentity';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import type { FollowRecommendation } from '@/lib/follow-recommendations';
import { cn } from '@/lib/cn';
import styles from './WhoToFollow.module.css';

interface WhoToFollowProps {
  viewerId?: string | null;
  limit?: number;
  className?: string;
  followedUserIds?: string[];
  onFollowChange?: (id: string, following: boolean) => void;
}
const languageNames: Record<string, string> = {
  TS: 'TypeScript',
  JS: 'JavaScript',
  PYTHON: 'Python',
  JAVA: 'Java',
  RUST: 'Rust',
  GO: 'Go',
  KOTLIN: 'Kotlin',
  SWIFT: 'Swift',
  CPP: 'C++',
};

export function WhoToFollow({
  viewerId,
  limit = 3,
  className,
  followedUserIds = [],
  onFollowChange,
}: WhoToFollowProps) {
  const { text } = useLocalizedText();
  const headingId = useId();
  const container = useRef<HTMLElement>(null);
  const request = useRef<AbortController | null>(null);
  const currentViewer = useRef(viewerId);
  currentViewer.current = viewerId;
  const mounted = useRef(false);
  const pendingIds = useRef(new Set<string>());
  const [profiles, setProfiles] = useState<FollowRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [followError, setFollowError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [followed, setFollowed] = useState<string[]>([]);
  const [pending, setPending] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!viewerId) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch('/api/users/suggestions', {
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Suggestions unavailable');
      const data: FollowRecommendation[] = await response.json();
      if (!controller.signal.aborted) setProfiles(Array.isArray(data) ? data : []);
    } catch {
      if (!controller.signal.aborted) setLoadError(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [viewerId]);

  useEffect(() => {
    mounted.current = true;
    setProfiles([]);
    setFollowed([]);
    setPending([]);
    setFeedback('');
    setFollowError('');
    setLoadError(false);
    setLoading(true);
    pendingIds.current.clear();
    if (!viewerId)
      return () => {
        mounted.current = false;
        request.current?.abort();
      };
    // Hidden desktop rails do not fetch recommendations on a phone.
    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined' && container.current) {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer?.disconnect();
          void load();
        }
      });
      observer.observe(container.current);
    } else {
      void load();
    }
    return () => {
      mounted.current = false;
      observer?.disconnect();
      request.current?.abort();
    };
  }, [viewerId, load]);

  async function follow(profile: FollowRecommendation) {
    if (pendingIds.current.has(profile.id) || !viewerId) return;
    const actingViewer = viewerId;
    pendingIds.current.add(profile.id);
    setPending([...pendingIds.current]);
    setFollowError('');
    setFeedback('');
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(profile.id)}/follow`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (!response.ok || data.following !== true)
        throw new Error(
          data.message ||
            text(
              'Não foi possível seguir este perfil. Tente novamente.',
              'Could not follow this profile. Please try again.'
            )
        );
      if (!mounted.current || currentViewer.current !== actingViewer) return;
      setFollowed((current) => [...current, profile.id]);
      setFeedback(
        text(`Agora você segue @${profile.username}.`, `You now follow @${profile.username}.`)
      );
      onFollowChange?.(profile.id, true);
      void load();
    } catch (error) {
      if (mounted.current && currentViewer.current === actingViewer)
        setFollowError(
          error instanceof Error && error.message !== 'Failed to fetch'
            ? error.message
            : text(
                'Falha de conexão. Tente seguir o perfil novamente.',
                'Connection failed. Try following this profile again.'
              )
        );
    } finally {
      if (mounted.current && currentViewer.current === actingViewer) {
        pendingIds.current.delete(profile.id);
        setPending([...pendingIds.current]);
      }
    }
  }
  function reasonLabel(reason: FollowRecommendation['reason'] | undefined) {
    if (reason?.type === 'mutual')
      return text(
        `Seguido por ${reason.count} ${reason.count === 1 ? 'pessoa que você segue' : 'pessoas que você segue'}`,
        `Followed by ${reason.count} ${reason.count === 1 ? 'person' : 'people'} you follow`
      );
    if (reason?.type === 'language' && reason.language)
      return text(
        `Também explora ${languageNames[reason.language] || reason.language}`,
        `Also explores ${languageNames[reason.language] || reason.language}`
      );
    if (reason?.type === 'interaction')
      return text('Conteúdo com que você interagiu', 'Content you have interacted with');
    return text('Descubra alguém da comunidade', 'Discover someone in the community');
  }
  if (!viewerId) return null;
  const excluded = new Set([...followed, ...followedUserIds, viewerId]);
  const visible = profiles
    .filter((profile) => !excluded.has(profile.id))
    .slice(0, Math.max(1, Math.min(10, limit)));
  return (
    <section ref={container} className={cn(styles.widget, className)} aria-labelledby={headingId}>
      <header className={styles.header}>
        <h2 id={headingId}>
          <UsersRound size={21} aria-hidden="true" />
          {text('Quem seguir', 'Who to follow')}
        </h2>
        <p>
          {text(
            'Encontre perfis a partir das suas conexões, linguagens e interações.',
            'Find profiles through your connections, languages, and interactions.'
          )}
        </p>
      </header>
      {feedback && (
        <p role="status" className={styles.status}>
          {feedback}
        </p>
      )}
      {followError && (
        <p role="alert" className={styles.status}>
          {followError}
        </p>
      )}
      {loading && profiles.length === 0 ? (
        <div
          role="status"
          aria-label={text('Carregando recomendações de perfis', 'Loading profile recommendations')}
        >
          {[0, 1, 2].map((index) => (
            <div key={index} className={styles.row} aria-hidden="true">
              <div className="h-10 w-10 shrink-0 rounded-full bg-dd-surface" />
              <div className={styles.skeleton}>
                <span />
                <span />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {visible.length ? (
            <ul>
              {visible.map((profile) => (
                <li key={profile.id} className={styles.row}>
                  <Link
                    href={`/profile/${encodeURIComponent(profile.username)}`}
                    className={styles.identity}
                    title={profile.display_name || profile.username}
                  >
                    <AuthorAvatar
                      username={profile.username}
                      avatar_url={profile.avatar_url}
                      avatar_config={profile.identity}
                      size="lg"
                    />
                    <span className={styles.copy}>
                      <span className={styles.nameRow}>
                        <span className={styles.name}>
                          {profile.display_name || profile.username}
                        </span>
                        {Boolean(profile.identity?.flags.length) && (
                          <span className={styles.flags}>
                            {profile.identity?.flags.map((flag) => (
                              <ProfileFlag key={flag} code={flag} />
                            ))}
                          </span>
                        )}
                      </span>
                      <span className={styles.handle}>@{profile.username}</span>
                      <span className={styles.reason}>{reasonLabel(profile.reason)}</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    className={styles.follow}
                    disabled={pending.includes(profile.id)}
                    aria-label={text(`Seguir @${profile.username}`, `Follow @${profile.username}`)}
                    onClick={() => void follow(profile)}
                  >
                    {pending.includes(profile.id)
                      ? text('Seguindo…', 'Following…')
                      : text('Seguir', 'Follow')}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !loadError && (
              <p className={styles.empty}>
                {text(
                  'Nenhum perfil novo para recomendar agora. Volte mais tarde para descobrir outras pessoas.',
                  'No new profiles to recommend right now. Come back later to discover more people.'
                )}
              </p>
            )
          )}
          {loadError && (
            <div role="alert" className={styles.status}>
              <p>
                {text('Não foi possível carregar as sugestões.', 'Could not load suggestions.')}
              </p>
              <button type="button" className={styles.retry} onClick={() => void load()}>
                {text('Tentar novamente', 'Try again')}
              </button>
            </div>
          )}
          {!loadError && (
            <button
              type="button"
              className={styles.refresh}
              disabled={loading}
              onClick={() => void load()}
            >
              {loading
                ? text('Atualizando…', 'Refreshing…')
                : text('Atualizar sugestões', 'Refresh suggestions')}
            </button>
          )}
        </>
      )}
    </section>
  );
}
