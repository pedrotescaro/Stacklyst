'use client';

import {
  ArrowRight,
  Backpack,
  ChevronRight,
  Flame,
  Globe2,
  Pencil,
  Play,
  Swords,
  PackageOpen as TreasureChest,
} from 'lucide-react';
import { Coin, PixelAvatar } from '@/components/mundinho/PixelArt';
import { adventureAsset } from '@/components/mundinho/assets';
import {
  CHECKIN_REWARDS,
  LANGUAGES,
  LANGUAGE_NAMES,
  levelProgress,
  type Avatar,
  type Course,
} from '@/lib/mundinho/types';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import '@/components/mundinho/mundinho.css';

const ASSET_BASE = '/assets/mundinho';
const noop = () => {};

export interface MundinhoHomeProps {
  avatar: Avatar;
  language: (typeof LANGUAGES)[number];
  coins: number;
  streak: number;
  totalXp: number;
  courses: Course[];
  /** Highlights "Entrar no Mundinho" while the walkthrough presses it. */
  enterPressed?: boolean;
}

/**
 * Projection of `AdventureHub`'s home view (the first screen of /trails):
 * same sections, classes and sprites, with the hub's data fetching, audio
 * and invitation polling left out.
 */
export function MundinhoHome({
  avatar,
  language,
  coins,
  streak,
  totalXp,
  courses,
  enterPressed = false,
}: MundinhoHomeProps) {
  const { text } = useLocalizedText();
  const xp = levelProgress(totalXp);
  const checkinCycle = 2;
  const missions = [
    {
      id: 'activity',
      name: text('Conclua uma lição de aprendizagem', 'Complete a learning lesson'),
      progress: 0,
      target: 1,
      reward: 20,
      tag: text('Fácil', 'Easy'),
      tagClass: 'tag-fácil',
    },
    {
      id: 'answers',
      name: text('Acerte 5 questões de código', 'Get 5 code questions right'),
      progress: 2,
      target: 5,
      reward: 15,
      tag: text('Médio', 'Medium'),
      tagClass: 'tag-médio',
    },
    {
      id: 'battle',
      name: text('Vença uma batalha de conceitos', 'Win a concept battle'),
      progress: 0,
      target: 1,
      reward: 20,
      tag: text('Lendário', 'Legendary'),
      tagClass: 'tag-lendário',
    },
  ];

  return (
    <div className="adventure adventure-home">
      <header className="ad-page-heading">
        <div className="ad-heading-text">
          <h1>{text('Trilhas de aprendizagem', 'Learning trails')}</h1>
          <p className="ad-subtitle">
            {text(
              'Aprenda programação de forma gamificada e divertida.',
              'Learn programming in a fun, gamified way.'
            )}
          </p>
        </div>
        <span className="ad-lessons-link">
          {text('Mapa de Lições', 'Lesson map')} <ArrowRight size={16} />
        </span>
      </header>

      <section
        className="ad-hero-banner"
        aria-label={text('Prévia do Meu Mundinho', 'My World preview')}
        style={{ backgroundImage: `url(${adventureAsset('forest-v2.png', ASSET_BASE)})` }}
      >
        <div className="ad-hero-overlay" />
        <div className="ad-hero-avatar-center">
          <PixelAvatar avatar={avatar} />
        </div>
        <label className="ad-home-language">
          {text('Linguagem do Mundinho', 'World language')}
          <select value={language} onChange={noop} tabIndex={-1}>
            {LANGUAGES.map((item) => (
              <option key={item} value={item}>
                {LANGUAGE_NAMES[item]}
              </option>
            ))}
          </select>
        </label>
        <div className="ad-hero-buttons-row">
          <button
            type="button"
            className="ad-enter-world-button"
            aria-label={text('Entrar no Mundinho', 'Enter the World')}
            data-pressed={enterPressed}
            tabIndex={-1}
          >
            <Globe2 size={22} />
            <span>{text('Entrar no Mundinho', 'Enter the World')}</span>
          </button>
          <button
            type="button"
            className="ad-hero-pencil-button"
            aria-label={text('Personalizar avatar', 'Customize avatar')}
            tabIndex={-1}
          >
            <Pencil size={20} />
          </button>
        </div>
      </section>

      <div className="ad-stats-two-cards">
        <button type="button" className="ad-card-stat" tabIndex={-1}>
          <span className="ad-stat-title">{text('Moedas', 'Coins')}</span>
          <div className="ad-stat-value-row">
            <span className="ad-stat-number">{coins.toLocaleString('pt-BR')}</span>
            <Coin className="ad-stat-coin" />
            <ChevronRight size={18} className="ad-stat-arrow" />
          </div>
        </button>
        <button type="button" className="ad-card-stat" tabIndex={-1}>
          <span className="ad-stat-title">{text('Sequência', 'Streak')}</span>
          <div className="ad-stat-value-row">
            <Flame size={20} className="fill-blue-400 text-blue-400" />
            <span className="ad-stat-number">
              {streak} {streak === 1 ? text('dia', 'day') : text('dias', 'days')}
            </span>
          </div>
        </button>
      </div>

      <div className="ad-radio-card">
        <button
          type="button"
          className="ad-radio-play-btn"
          aria-label={text('Ouvir rádio', 'Play radio')}
          tabIndex={-1}
        >
          <Play size={18} className="translate-x-0.5" />
        </button>
        <div className="ad-radio-info">
          <span>{text('Toque para ouvir o rádio', 'Tap to listen to the radio')}</span>
        </div>
      </div>

      <div className="ad-level-bar-card">
        <div className="ad-level-bar-labels">
          <strong>
            {text('Nível', 'Level')} {xp.level}
          </strong>
          <span>
            {xp.current} / {xp.needed} XP
          </span>
        </div>
        <div className="ad-level-track">
          <div
            className="ad-level-fill"
            style={{
              width: `${Math.min(100, Math.max(5, (xp.current / Math.max(1, xp.needed)) * 100))}%`,
            }}
          />
        </div>
      </div>

      <section className="ad-checkin-section">
        <h2 className="ad-section-title">Check-In</h2>
        <div className="ad-checkin-badges-row">
          {CHECKIN_REWARDS.map((reward, index) => {
            const isToday = checkinCycle === index;
            const isClaimed = index < checkinCycle;
            return (
              <div
                key={index}
                className={`ad-checkin-day-pill ${isToday ? 'is-today' : ''} ${isClaimed ? 'is-claimed' : ''}`}
              >
                <div className="ad-checkin-coin-badge">
                  <Coin />
                  <span className="ad-checkin-badge-number">{reward}</span>
                </div>
                <span className="ad-checkin-day-label">
                  {isToday ? text('Hoje', 'Today') : `${text('Dia', 'Day')} ${index + 1}`}
                </span>
              </div>
            );
          })}
        </div>
        <button type="button" className="ad-checkin-yellow-button" tabIndex={-1}>
          {text('Fazer check-in', 'Check in')}
        </button>
      </section>

      <section className="ad-missions-section">
        <h2 className="ad-section-title">{text('Missões diárias', 'Daily missions')}</h2>
        <div className="ad-missions-list">
          {missions.map((mission) => (
            <article key={mission.id} className="ad-mission-item">
              <div className="ad-mission-header">
                <span className={`ad-mission-tag ${mission.tagClass}`}>{mission.tag}</span>
                <span className="ad-mission-progress-badge">
                  {mission.progress} / {mission.target}
                </span>
              </div>
              <div className="ad-mission-body">
                <p className="ad-mission-name">{mission.name}</p>
                <div className="ad-mission-reward-row">
                  <span className="ad-mission-reward">
                    <Coin /> +{mission.reward} {text('moedas', 'coins')}
                  </span>
                  <button type="button" className="ad-claim-mission-btn" disabled tabIndex={-1}>
                    {text('Resgatar', 'Claim')}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ad-courses-section">
        <div className="ad-section-header-row">
          <h2 className="ad-section-title">{text('Trilhas de Aprendizagem', 'Learning Trails')}</h2>
          <span className="ad-see-all-btn">
            {text('Ver todas', 'See all')} <ChevronRight size={16} />
          </span>
        </div>
        <div className="ad-courses-grid">
          {courses.map((course) => (
            <button type="button" key={course.language} className="ad-course-card" tabIndex={-1}>
              <div className="ad-course-icon-box">
                {/* eslint-disable-next-line @next/next/no-img-element -- static local logo, same as the hub */}
                <img
                  src={adventureAsset(`${course.language.toLowerCase()}.svg`, ASSET_BASE)}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="ad-course-info">
                <h3>{LANGUAGE_NAMES[course.language] ?? course.language}</h3>
                <p className="ad-course-progress-text">
                  {course.completed} / {course.total} {text('conhecimentos', 'topics')}
                </p>
                <div className="ad-course-progress-track">
                  <div
                    className="ad-course-progress-fill"
                    style={{
                      width: `${Math.min(100, (course.completed / Math.max(1, course.total)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="ad-course-action">
                  {text('Continuar aprendendo', 'Continue learning')} <ArrowRight size={13} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="ad-shortcuts-grid">
        <button type="button" className="ad-shortcut-btn" tabIndex={-1}>
          <Swords className="text-sky-400" size={24} />
          <div>
            <strong>{text('Batalhas de Conceitos', 'Concept Battles')}</strong>
            <small>{text('Duelo de perguntas e habilidades', 'Question and skill duels')}</small>
          </div>
          <ChevronRight size={18} />
        </button>
        <button type="button" className="ad-shortcut-btn" tabIndex={-1}>
          <PixelAvatar avatar={avatar} />
          <div>
            <strong>{text('Personalizar Avatar', 'Customize Avatar')}</strong>
            <small>{text('Roupas, cabelos e acessórios', 'Outfits, hair and accessories')}</small>
          </div>
          <ChevronRight size={18} />
        </button>
        <button type="button" className="ad-shortcut-btn" tabIndex={-1}>
          <TreasureChest className="text-amber-400" size={24} />
          <div>
            <strong>{text('Loja de Itens', 'Item Store')}</strong>
            <small>
              {text(
                'Equipamentos e cosméticos com suas moedas',
                'Gear and cosmetics for your coins'
              )}
            </small>
          </div>
          <ChevronRight size={18} />
        </button>
        <button type="button" className="ad-shortcut-btn" tabIndex={-1}>
          <Backpack className="text-indigo-400" size={24} />
          <div>
            <strong>{text('Meu Inventário', 'My Inventory')}</strong>
            <small>
              {text('Equipar itens, títulos e acessórios', 'Equip items, titles and accessories')}
            </small>
          </div>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
