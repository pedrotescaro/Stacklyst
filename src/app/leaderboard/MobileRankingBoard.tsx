'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Trophy, Pencil } from 'lucide-react';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { FeedRankingSwitcher, feedRankingSurfaceClassName } from '@/components/FeedRankingSwitcher';
import { ProfileName, ProfileTitle } from '@/components/profile/ProfileIdentity';
import { getAuthorDisplayName, readProfileIdentity } from '@/lib/profile-style';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import {
  getTrailLanguageMetadata,
  TRAIL_LANGUAGE_CODES,
  type TrailLanguageCode,
} from '@/app/trails/TrailLanguageLogo';
import type { LeaderboardRow } from './LeaderboardClient';
import styles from './MobileRankingBoard.module.css';

type Scope = TrailLanguageCode | 'GLOBAL';

export function MobileRankingBoard({
  initialLeaderboard,
  initialLanguage,
  initialGlobalLeaderboard,
}: {
  initialLeaderboard: LeaderboardRow[];
  initialLanguage: TrailLanguageCode;
  initialGlobalLeaderboard?: LeaderboardRow[];
}) {
  const { text, locale } = useLocalizedText();
  const [scope, setScope] = useState<Scope>(initialGlobalLeaderboard ? 'GLOBAL' : initialLanguage);
  const [rows, setRows] = useState(initialGlobalLeaderboard ?? initialLeaderboard);
  const [loading, setLoading] = useState(!initialGlobalLeaderboard);
  const mounted = useRef(false);
  const [error, setError] = useState(false);
  const [request, setRequest] = useState(0);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (initialGlobalLeaderboard) return;
    }
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams();
        if (period) params.set('period', period);
        if (scope !== 'GLOBAL') params.set('language', scope);
        const url = `/api/leaderboard${params.size ? `?${params}` : ''}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('Leaderboard request failed');
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid leaderboard response');
        if (!controller.signal.aborted) setRows(data);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [scope, request, period, initialGlobalLeaderboard]);

  function changeScope(value: Scope) {
    setScope(value);
    setRequest((previous) => previous + 1);
  }

  const podium = [2, 1, 3].map((rank) => rows.find((row) => row.rank === rank));
  const rest = rows.filter((row) => row.rank > 3);

  function player(row: LeaderboardRow, featured = false) {
    const name = getAuthorDisplayName(row);
    const identity = readProfileIdentity(row.avatar_config);
    const xp = Math.max(0, row.xp).toLocaleString(locale);
    return (
      <Link
        href={`/profile/${encodeURIComponent(row.username)}`}
        className={featured ? styles.podiumPlayer : styles.row}
        aria-label={text(
          `Classificação: ${row.rank}º lugar, ${name}, ${xp} XP`,
          `Ranking: rank ${row.rank}, ${name}, ${xp} XP`
        )}
      >
        {!featured && <span className={styles.rowRank}>{row.rank}</span>}
        <div className={featured ? styles.podiumAvatar : styles.rowAvatar}>
          <AuthorAvatar
            username={row.username}
            avatar_url={row.avatar_url}
            avatar_config={row.avatar_config}
            size="lg"
            className={
              featured ? (row.rank === 1 ? styles.firstAvatar : styles.featuredAvatar) : ''
            }
          />
        </div>
        <div className={styles.identity}>
          <div className={styles.nameLine}>
            <span className={styles.name}>
              <ProfileName config={row.avatar_config}>{name}</ProfileName>
            </span>
            {identity.title && <ProfileTitle title={identity.title} />}
          </div>
          {!featured && <span className={styles.username}>@{row.username}</span>}
        </div>
        <span className={styles.xp}>{xp} XP</span>
        {featured && (
          <span className={styles.podiumBase} data-rank={row.rank} aria-hidden="true">
            {row.rank}
          </span>
        )}
      </Link>
    );
  }

  return (
    <section
      className={`${styles.board} ${feedRankingSurfaceClassName}`}
      aria-label={text('Ranking', 'Ranking')}
    >
      <FeedRankingSwitcher active="ranking" />
      <div className="my-2 flex items-center gap-2" role="group" aria-label="Período do ranking">
        {(['daily', 'weekly', 'monthly'] as const).map((value, i) => (
          <button
            type="button"
            key={value}
            aria-pressed={period === value}
            onClick={() => setPeriod(period === value ? null : value)}
            className={`min-h-11 rounded-full border px-3 text-xs font-bold ${period === value ? 'border-dd-accent bg-dd-accent text-white' : 'border-dd-border text-dd-muted'}`}
          >
            {['Diário', 'Semanal', 'Mensal'][i]}
          </button>
        ))}
        <button
          type="button"
          aria-label="Escolher linguagem do ranking"
          aria-expanded={editing}
          onClick={() => setEditing(!editing)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dd-border"
        >
          <Pencil size={16} />
        </button>
      </div>
      {editing && (
        <label className="block mb-3 text-sm">
          Linguagem
          <select
            aria-label="Classificação"
            className="block w-full bg-dd-surface border border-dd-border rounded-xl p-3"
            value={scope}
            onChange={(e) => {
              changeScope(e.target.value as Scope);
              setEditing(false);
            }}
          >
            <option value="GLOBAL">Global</option>
            {TRAIL_LANGUAGE_CODES.map((code) => (
              <option key={code} value={code}>
                {getTrailLanguageMetadata(code).label}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="mb-4 text-xs text-dd-muted">
        {scope === 'GLOBAL' ? 'Global' : getTrailLanguageMetadata(scope).label} ·{' '}
        {period
          ? 'XP do período. O histórico anterior inclui exercícios registrados; outras atividades anteriores podem faltar.'
          : 'XP acumulado desde o início da plataforma.'}
      </p>
      <div aria-busy={loading} aria-live="polite">
        {loading ? (
          <p className={styles.message}>{text('Carregando classificação…', 'Loading ranking…')}</p>
        ) : error ? (
          <div className={styles.message} role="alert">
            <p>{text('Não foi possível carregar o ranking.', 'Could not load the ranking.')}</p>
            <button type="button" onClick={() => setRequest((previous) => previous + 1)}>
              {text('Tentar novamente', 'Try again')}
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className={styles.message}>
            <Trophy aria-hidden="true" size={24} />
            <p>
              {text(
                'Ainda não há participantes nesta classificação.',
                'There are no participants in this ranking yet.'
              )}
            </p>
          </div>
        ) : (
          <div className={styles.results} key={scope}>
            <div className={styles.podium} aria-label={text('Pódio', 'Podium')}>
              {podium.map((row, index) => (
                <div
                  key={[2, 1, 3][index]}
                  className={styles.podiumSlot}
                  data-rank={[2, 1, 3][index]}
                >
                  {row && player(row, true)}
                </div>
              ))}
            </div>
            {rest.length > 0 && (
              <div className={styles.list}>
                {rest.map((row) => (
                  <div key={row.username}>{player(row)}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
