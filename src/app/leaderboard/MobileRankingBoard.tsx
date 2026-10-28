'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [request, setRequest] = useState(0);

  useEffect(() => {
    if (request === 0) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const url = scope === 'GLOBAL' ? '/api/leaderboard' : `/api/leaderboard?language=${scope}`;
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
  }, [scope, request]);

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
      <div className={styles.heading}>
        <div>
          <h2>{text('Ranking de XP', 'XP ranking')}</h2>
          <p>{text('Classificação por XP acumulado', 'Ranked by accumulated XP')}</p>
        </div>
        <label className={styles.scope}>
          <span>{text('Classificação', 'Ranking scope')}</span>
          <select value={scope} onChange={(event) => changeScope(event.target.value as Scope)}>
            <option value="GLOBAL">{text('Global', 'Global')}</option>
            {TRAIL_LANGUAGE_CODES.map((code) => (
              <option key={code} value={code}>
                {getTrailLanguageMetadata(code).label}
              </option>
            ))}
          </select>
        </label>
      </div>
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
