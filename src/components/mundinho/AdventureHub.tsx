'use client';

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  Backpack,
  Calendar,
  Check,
  ChevronRight,
  Crown,
  Flame,
  Globe2,
  Map,
  Music,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  RotateCw,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
  PackageOpen as TreasureChest,
  Volume2,
  X,
} from 'lucide-react';
import {
  CHECKIN_REWARDS,
  CREATURES,
  DEFAULT_AVATAR,
  ITEMS,
  LANGUAGES,
  LANGUAGE_NAMES,
  levelProgress,
  type AdventureAction,
  type AdventureState,
  type AdventureTransport,
  type Avatar,
  type Course,
} from '../../lib/mundinho/types';
import { SKILLS } from '../../lib/mundinho/rules';
import { Coin, HAIR, OUTFIT, PixelAvatar, PixelCreature, SKIN } from './PixelArt';
import './mundinho.css';
import { adventureAsset } from './assets';

const World = lazy(() => import('./World'));

type View =
  | 'home'
  | 'world'
  | 'battle'
  | 'avatar'
  | 'wallet'
  | 'store'
  | 'inventory'
  | 'recharge'
  | 'missions'
  | 'profile';

const TITLES: Record<View, string> = {
  home: 'Trilhas de aprendizagem',
  world: 'Meu Mundinho',
  battle: 'Batalha de Conceitos',
  avatar: 'Avatar',
  wallet: 'Moedas',
  store: 'Loja de Itens',
  inventory: 'Meu Inventário',
  recharge: 'Recarga',
  missions: 'Missões Diárias',
  profile: 'Perfil de Aventureiro',
};

function formatTransactionDate(iso: string) {
  try {
    const d = new Date(iso);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'jan.',
      'fev.',
      'mar.',
      'abr.',
      'mai.',
      'jun.',
      'jul.',
      'ago.',
      'set.',
      'out.',
      'nov.',
      'dez.',
    ];
    const month = months[d.getMonth()] || '';
    const year = String(d.getFullYear()).slice(-2);
    return `${hours}:${minutes} ${day} ${month} ${year}`;
  } catch {
    return iso;
  }
}

export function AdventureHub({
  transport,
  courses,
  onCourse,
  assetBase = '/assets/mundinho',
}: {
  transport: AdventureTransport;
  courses: Course[];
  onCourse: (language?: string) => void;
  assetBase?: string;
}) {
  const [data, setData] = useState<AdventureState | null>(null);
  const [view, setView] = useState<View>('home');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [radioPlaying, setRadioPlaying] = useState(false);

  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>('PYTHON');
  const [creature, setCreature] = useState(CREATURES[0].id);

  // Avatar Editor State
  const [draft, setDraft] = useState<Avatar>(DEFAULT_AVATAR);
  const [category, setCategory] = useState<keyof Avatar>('skin');
  const [direction, setDirection] = useState(0); // 0: down, 1: right, 2: up, 3: left
  const [confirm, setConfirm] = useState<string | null>(null);

  const heading = useRef<HTMLHeadingElement>(null);
  const pending = useRef(false);

  const load = useCallback(async () => {
    if (pending.current) return;
    try {
      const next = await transport();
      setData(next);
      setError('');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Não foi possível carregar o Mundinho. Tente novamente.'
      );
    }
  }, [transport]);

  useEffect(() => {
    void load();
    const refresh = () => {
      if (document.visibilityState === 'visible') void load();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    const timer = setInterval(refresh, 60000);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      clearInterval(timer);
    };
  }, [load]);

  const go = (next: View) => {
    setView(next);
    setError('');
    setNotice('');
    setConfirm(null);
    if (next === 'avatar' && data) {
      setDraft(data.avatar);
    }
  };

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  const act = async (action: AdventureAction, success?: string) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const next = await transport(action);
      setData(next);
      if (success) setNotice(success);
      return next;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Não foi possível executar a ação. Tente novamente.'
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  // Sound generator for radio demo
  const audioContext = useRef<AudioContext | null>(null);
  const toggleRadio = () => {
    if (!radioPlaying) {
      try {
        if (!audioContext.current) {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioContext.current = new AudioCtx();
        }
        if (audioContext.current.state === 'suspended') {
          audioContext.current.resume();
        }
      } catch {}
      setRadioPlaying(true);
      setNotice('Tocando rádio de estudos lo-fi.');
    } else {
      setRadioPlaying(false);
      setNotice('');
    }
  };

  const xp = levelProgress(data?.totalXp ?? 0);
  const battle = data?.battle;
  const opponent =
    CREATURES.find((c) => c.id === battle?.creature) ??
    CREATURES.find((c) => c.id === creature) ??
    CREATURES[0];
  const equippedAvatar = data?.avatar ?? DEFAULT_AVATAR;

  const startBattle = async (selectedLang = language, selectedCreature = creature) => {
    const next = await act({
      type: 'battle-start',
      language: selectedLang,
      creature: selectedCreature,
    });
    if (next) go('battle');
  };

  return (
    <div className={`adventure adventure-${view}`}>
      {/* HEADER BAR */}
      <header className="ad-page-heading">
        {view !== 'home' ? (
          <button
            className="ad-back-button"
            aria-label="Voltar para a tela inicial"
            onClick={() => go('home')}
          >
            <ArrowLeft size={22} />
          </button>
        ) : null}

        <div className="ad-heading-text">
          <h1 tabIndex={-1} ref={heading}>
            {TITLES[view]}
          </h1>
          {view === 'home' && (
            <p className="ad-subtitle">Aprenda programação de forma gamificada e divertida.</p>
          )}
        </div>

        {view === 'home' && (
          <button
            className="ad-lessons-link"
            onClick={() => onCourse()}
            title="Acessar mapa completo de lições"
          >
            Mapa de Lições <ArrowRight size={16} />
          </button>
        )}

        {view === 'avatar' && (
          <button
            className="ad-save-pill"
            disabled={busy || !data}
            onClick={() =>
              void act(
                { type: 'avatar', avatar: draft },
                'Avatar salvo! Visual atualizado no mundo e nas batalhas.'
              )
            }
          >
            {busy ? 'Salvando…' : 'Salvar'}
          </button>
        )}
      </header>

      {/* ERROR & SUCCESS NOTICES */}
      {error && (
        <div className="ad-error" role="alert">
          <span>{error}</span>
          <button onClick={() => void load()}>Tentar novamente</button>
        </div>
      )}
      {notice && (
        <div className="ad-notice" role="status">
          <Check size={18} />
          <span>{notice}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. VIEW: HOME (Matching Image 1)                            */}
      {/* ============================================================ */}
      {view === 'home' && (
        <>
          {/* Top Hero Banner */}
          <section
            className="ad-hero-banner"
            aria-label="Prévia do Meu Mundinho"
            style={{
              backgroundImage: `url(${adventureAsset('forest.png', assetBase)})`,
            }}
          >
            <div className="ad-hero-overlay" />
            <div className="ad-hero-avatar-center">
              <PixelAvatar avatar={equippedAvatar} effect={Boolean(data?.equipped.effect)} />
            </div>

            <div className="ad-hero-buttons-row">
              <button className="ad-enter-world-button" onClick={() => go('world')}>
                <Globe2 size={22} />
                <span>Entrar no Mundinho</span>
              </button>
              <button
                className="ad-hero-pencil-button"
                aria-label="Personalizar avatar"
                onClick={() => go('avatar')}
              >
                <Pencil size={20} />
              </button>
            </div>
          </section>

          {/* Stats Row (Moedas + Sequência, Matching Image 1) */}
          <div className="ad-stats-two-cards">
            <button
              onClick={() => go('wallet')}
              className="ad-card-stat"
              title="Ver extrato de moedas"
            >
              <span className="ad-stat-title">Moedas</span>
              <div className="ad-stat-value-row">
                <span className="ad-stat-number">
                  {data ? data.coins.toLocaleString('pt-BR') : '0'}
                </span>
                <Coin className="ad-stat-coin" />
                <ChevronRight size={18} className="ad-stat-arrow" />
              </div>
            </button>

            <button
              onClick={() => {
                document
                  .getElementById('daily-checkin')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="ad-card-stat"
              title="Sequência de dias"
            >
              <span className="ad-stat-title">Sequência</span>
              <div className="ad-stat-value-row">
                <Flame size={20} className="text-blue-400 fill-blue-400" />
                <span className="ad-stat-number">
                  {data ? data.checkin.streak : 0} {data?.checkin.streak === 1 ? 'dia' : 'dias'}
                </span>
              </div>
            </button>
          </div>

          {/* Radio Player Card (Matching Image 1) */}
          <div className="ad-radio-card" onClick={toggleRadio}>
            <button
              className={`ad-radio-play-btn ${radioPlaying ? 'is-playing' : ''}`}
              aria-label={radioPlaying ? 'Pausar rádio' : 'Ouvir rádio'}
            >
              {radioPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
            </button>
            <div className="ad-radio-info">
              <span>
                {radioPlaying ? 'Tocando rádio de estudos lo-fi' : 'Toque para ouvir o rádio'}
              </span>
            </div>
            {radioPlaying && (
              <div className="ad-radio-waves">
                <span className="wave-bar bar-1" />
                <span className="wave-bar bar-2" />
                <span className="wave-bar bar-3" />
              </div>
            )}
          </div>

          {/* XP & Level Bar (Matching Image 1) */}
          <div className="ad-level-bar-card">
            <div className="ad-level-bar-labels">
              <strong>Nível {data ? xp.level : 1}</strong>
              <span>{data ? `${xp.current} / ${xp.needed} XP` : '0 / 100 XP'}</span>
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

          {/* Daily Check-In Section (Matching Image 1) */}
          <section className="ad-checkin-section" id="daily-checkin">
            <h2 className="ad-section-title">Check-In</h2>
            <div className="ad-checkin-badges-row">
              {CHECKIN_REWARDS.map((reward, i) => {
                const isToday = data?.checkin.cycle === i;
                const isClaimed =
                  Boolean(data) &&
                  (i < data!.checkin.cycle || (i === data!.checkin.cycle && data!.checkin.claimed));

                return (
                  <div
                    key={i}
                    className={`ad-checkin-day-pill ${isToday ? 'is-today' : ''} ${isClaimed ? 'is-claimed' : ''}`}
                  >
                    <div className="ad-checkin-coin-badge">
                      <Coin />
                      <span className="ad-checkin-badge-number">{reward}</span>
                    </div>
                    <span className="ad-checkin-day-label">
                      {isToday ? (data?.checkin.claimed ? 'Resgatado' : 'Hoje') : `Dia ${i + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Prominent Yellow Button from Image 1 */}
            <button
              className="ad-checkin-yellow-button"
              disabled={!data || busy || data.checkin.claimed}
              onClick={() =>
                void act(
                  { type: 'checkin' },
                  `Check-in realizado com sucesso! +${data?.checkin.reward} moedas adicionadas.`
                )
              }
            >
              {data?.checkin.claimed ? (
                <>
                  <Check size={20} strokeWidth={3} />
                  <span>Check-in de hoje realizado</span>
                </>
              ) : busy ? (
                'Resgatando moedas…'
              ) : (
                `Fazer check-in`
              )}
            </button>
          </section>

          {/* Daily Missions (Matching Image 1) */}
          <section className="ad-missions-section">
            <h2 className="ad-section-title">Missões diárias</h2>
            <div className="ad-missions-list">
              {(
                data?.missions ?? [
                  {
                    id: 'activity',
                    name: 'Conclua uma lição de aprendizagem',
                    progress: 0,
                    target: 1,
                    reward: 20,
                    claimed: false,
                  },
                  {
                    id: 'answers',
                    name: 'Acerte 5 questões de código',
                    progress: 0,
                    target: 5,
                    reward: 15,
                    claimed: false,
                  },
                  {
                    id: 'battle',
                    name: 'Vença uma batalha de conceitos',
                    progress: 0,
                    target: 1,
                    reward: 20,
                    claimed: false,
                  },
                ]
              ).map((m, idx) => {
                const tag = idx === 0 ? 'Fácil' : idx === 1 ? 'Médio' : 'Lendário';
                return (
                  <article key={m.id} className="ad-mission-item">
                    <div className="ad-mission-header">
                      <span className={`ad-mission-tag tag-${tag.toLowerCase()}`}>{tag}</span>
                      <span className="ad-mission-progress-badge">
                        {m.progress} / {m.target}
                      </span>
                    </div>
                    <div className="ad-mission-body">
                      <p className="ad-mission-name">{m.name}</p>
                      <div className="ad-mission-reward-row">
                        <span className="ad-mission-reward">
                          <Coin /> +{m.reward} moedas
                        </span>
                        <button
                          className="ad-claim-mission-btn"
                          disabled={busy || m.claimed || m.progress < m.target}
                          onClick={() =>
                            void act(
                              { type: 'mission', mission: m.id },
                              'Missão resgatada com sucesso!'
                            )
                          }
                        >
                          {m.claimed ? 'Resgatado' : 'Resgatar'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Trilhas de Aprendizagem (Section 9) */}
          <section className="ad-courses-section">
            <div className="ad-section-header-row">
              <h2 className="ad-section-title">Trilhas de Aprendizagem</h2>
              <button className="ad-see-all-btn" onClick={() => onCourse()}>
                Ver todas <ChevronRight size={16} />
              </button>
            </div>

            <div className="ad-courses-grid">
              {courses.map((course) => (
                <button
                  key={course.language}
                  className="ad-course-card"
                  onClick={() => onCourse(course.language)}
                >
                  <div className="ad-course-icon-box">
                    <img
                      src={adventureAsset(`${course.language.toLowerCase()}.svg`, assetBase)}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div className="ad-course-info">
                    <h3>{LANGUAGE_NAMES[course.language] ?? course.language}</h3>
                    <p className="ad-course-progress-text">
                      {course.completed} / {course.total} conhecimentos
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
                      Continuar aprendendo <ArrowRight size={13} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Quick Shortcuts to Features */}
          <div className="ad-shortcuts-grid">
            <button className="ad-shortcut-btn" onClick={() => go('battle')}>
              <Swords className="text-sky-400" size={24} />
              <div>
                <strong>Batalhas de Conceitos</strong>
                <small>Duelo de perguntas e habilidades</small>
              </div>
              <ChevronRight size={18} />
            </button>

            <button className="ad-shortcut-btn" onClick={() => go('avatar')}>
              <PixelAvatar avatar={equippedAvatar} />
              <div>
                <strong>Personalizar Avatar</strong>
                <small>Roupas, cabelos e acessórios</small>
              </div>
              <ChevronRight size={18} />
            </button>

            <button className="ad-shortcut-btn" onClick={() => go('store')}>
              <TreasureChest className="text-amber-400" size={24} />
              <div>
                <strong>Loja de Itens</strong>
                <small>Compre cosméticos com suas moedas</small>
              </div>
              <ChevronRight size={18} />
            </button>

            <button className="ad-shortcut-btn" onClick={() => go('inventory')}>
              <Backpack className="text-indigo-400" size={24} />
              <div>
                <strong>Meu Inventário</strong>
                <small>Equipar títulos e molduras</small>
              </div>
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* 2. VIEW: WALLET / MOEDAS & EXTRATO (Matching Image 5)       */}
      {/* ============================================================ */}
      {view === 'wallet' && (
        <div className="ad-wallet-view">
          {/* Card: Saldo Atual (Matching Image 5) */}
          <div className="ad-balance-card">
            <div className="ad-balance-left">
              <span className="ad-balance-label">Saldo atual</span>
              <div className="ad-balance-amount-row">
                <strong className="ad-balance-number">
                  {data ? data.coins.toLocaleString('pt-BR') : '0'}
                </strong>
                <Coin className="ad-balance-coin" />
              </div>
            </div>
            {/* Blue circle button with up arrow leading to Recarga (Image 2) */}
            <button
              className="ad-recharge-blue-circle"
              aria-label="Abrir tela de recarga"
              title="Recarregar moedas"
              onClick={() => go('recharge')}
            >
              <ArrowUp size={24} strokeWidth={2.8} />
            </button>
          </div>

          {/* Section: Extrato (Matching Image 5) */}
          <section className="ad-ledger-section">
            <h2 className="ad-ledger-heading">Extrato</h2>
            <div className="ad-ledger-list">
              {(data?.transactions ?? []).map((t) => (
                <article key={t.id} className="ad-ledger-card">
                  <div className="ad-ledger-details">
                    <h3 className="ad-ledger-label">{t.label}</h3>
                    <span className="ad-ledger-date">{formatTransactionDate(t.createdAt)}</span>
                  </div>
                  <strong
                    className={`ad-ledger-value ${t.amount >= 0 ? 'is-positive' : 'is-negative'}`}
                  >
                    {t.amount > 0 ? `+${t.amount}` : t.amount}
                  </strong>
                </article>
              ))}

              {data && data.transactions.length === 0 && (
                <div className="ad-empty-ledger">
                  <p>Nenhuma transação recente.</p>
                  <small>
                    Faça o check-in diário ou conclua lições para receber suas primeiras moedas.
                  </small>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. VIEW: RECARGA (Matching Image 2)                         */}
      {/* ============================================================ */}
      {view === 'recharge' && (
        <div className="ad-recharge-view">
          <div className="ad-recharge-notice">
            <Shield size={20} className="text-amber-400 flex-shrink-0" />
            <p>
              <strong>Em breve:</strong> Pacotes demonstrativos. Pagamentos e cobranças estão
              desativados no momento.
            </p>
          </div>

          <div className="ad-packages-list">
            {[
              {
                id: 'punhado',
                name: 'Punhado',
                amount: 100,
                bonus: '+50 para apoiadores',
                price: 'R$ 2,90',
              },
              {
                id: 'bolsa',
                name: 'Bolsa',
                amount: 300,
                bonus: '+150 para apoiadores',
                price: 'R$ 5,90',
              },
              {
                id: 'bau',
                name: 'Baú',
                amount: 900,
                bonus: '+450 para apoiadores',
                price: 'R$ 12,90',
              },
              {
                id: 'cofre',
                name: 'Cofre',
                amount: 2000,
                bonus: '+1.000 para apoiadores',
                price: 'R$ 24,90',
              },
              {
                id: 'tesouro',
                name: 'Tesouro',
                amount: 4500,
                bonus: '+2.250 para apoiadores',
                price: 'R$ 49,90',
              },
              {
                id: 'montanha',
                name: 'Montanha',
                amount: 10000,
                bonus: '+5.000 para apoiadores',
                price: 'R$ 99,90',
              },
            ].map((pkg) => (
              <article key={pkg.id} className="ad-package-card">
                <div className="ad-pkg-icon-wrap">
                  <TreasureChest size={36} className="text-amber-400" />
                </div>
                <div className="ad-pkg-info">
                  <h3 className="ad-pkg-name">{pkg.name}</h3>
                  <div className="ad-pkg-amount-row">
                    <span className="ad-pkg-amount">{pkg.amount.toLocaleString('pt-BR')}</span>
                    <Coin className="ad-pkg-coin" />
                  </div>
                  <small className="ad-pkg-bonus">{pkg.bonus}</small>
                </div>
                <button
                  className="ad-pkg-buy-btn"
                  onClick={() =>
                    setNotice(`O pacote "${pkg.name}" estará disponível para aquisição em breve!`)
                  }
                >
                  {pkg.price}
                </button>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. VIEW: AVATAR CUSTOMIZER (Matching Image 4)                */}
      {/* ============================================================ */}
      {view === 'avatar' && (
        <div className="ad-avatar-editor-view">
          {/* Large Checkerboard Preview Area with Rotate Buttons */}
          <div className="ad-checkerboard-preview">
            <button
              className="ad-rotate-btn"
              aria-label="Girar à esquerda"
              onClick={() => setDirection((direction + 3) % 4)}
            >
              <RotateCcw size={22} />
            </button>

            <div className="ad-avatar-preview-box">
              <PixelAvatar avatar={draft} direction={['down', 'right', 'up', 'left'][direction]} />
            </div>

            <button
              className="ad-rotate-btn"
              aria-label="Girar à direita"
              onClick={() => setDirection((direction + 1) % 4)}
            >
              <RotateCw size={22} />
            </button>
          </div>

          {/* Category Tabs (Matching Image 4) */}
          <div className="ad-category-tabs-row" role="tablist">
            {[
              { id: 'skin', label: 'Corpo' },
              { id: 'eyes', label: 'Olhos' },
              { id: 'outfit', label: 'Roupas' },
              { id: 'hair', label: 'Cabelo' },
              { id: 'accessory', label: 'Acessórios' },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={category === tab.id}
                className={`ad-category-tab ${category === tab.id ? 'is-selected' : ''}`}
                onClick={() => setCategory(tab.id as keyof Avatar)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 3-Column Grid of Avatar Options (Matching Image 4) */}
          <div className="ad-options-grid-three">
            {Array.from(
              {
                length:
                  {
                    skin: SKIN.length,
                    eyes: 5,
                    hair: 4,
                    hairColor: HAIR.length,
                    outfit: OUTFIT.length,
                    accessory: 4,
                  }[category] || 4,
              },
              (_, i) => {
                const isSelected = draft[category] === i;
                const item = ITEMS.find((it) => it.category === category && it.value === i);
                const locked = Boolean(item && !data?.inventory.includes(item.id));

                return (
                  <button
                    key={i}
                    className={`ad-option-tile ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      if (locked) {
                        go('store');
                      } else {
                        setDraft({ ...draft, [category]: i });
                      }
                    }}
                  >
                    {isSelected && (
                      <div className="ad-option-checkmark">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                    <div className="ad-option-avatar-inner">
                      <PixelAvatar avatar={{ ...draft, [category]: i }} />
                    </div>
                    {locked && (
                      <div className="ad-option-locked-badge">
                        <Coin className="w-3.5 h-3.5" />
                        <span>{item?.price}</span>
                      </div>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. VIEW: WORLD (2D Pixel Art RPG, Matching Image 3)          */}
      {/* ============================================================ */}
      {view === 'world' && (
        <Suspense fallback={<p className="ad-loading">Carregando o mundinho em pixel art…</p>}>
          <World
            avatar={equippedAvatar}
            assetBase={assetBase}
            username={data?.username ?? 'Pedrolado'}
            onBack={() => go('home')}
            onInventory={() => go('inventory')}
            onEncounter={(id) => {
              setCreature(id);
              void startBattle(language, id);
            }}
            onChest={async () => {
              await act({ type: 'chest' });
            }}
          />
        </Suspense>
      )}

      {/* ============================================================ */}
      {/* 6. VIEW: BATTLE (Concept Educational Battles, Section 10)    */}
      {/* ============================================================ */}
      {view === 'battle' && (
        <div className="ad-battle-view">
          {(!battle || battle.status !== 'active') && (
            <div className="ad-battle-lobby">
              <div className="ad-lobby-header">
                <h2>Batalhas de Conceitos</h2>
                <p>
                  Desafie criaturas com perguntas e habilidades reais de programação. Cada acerto
                  causa dano e ensina um fundamento.
                </p>
              </div>

              <div className="ad-lobby-controls">
                <label className="ad-lobby-label">
                  Linguagem do Combate
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as typeof language)}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {LANGUAGE_NAMES[l]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="ad-lobby-label">
                  Criatura Oponente
                  <select value={creature} onChange={(e) => setCreature(e.target.value)}>
                    {CREATURES.map((c) => (
                      <option value={c.id} key={c.id}>
                        {c.name} · Nível {c.level}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                className="ad-start-battle-btn"
                disabled={!data || busy}
                onClick={() => void startBattle()}
              >
                <Swords size={22} />
                <span>Iniciar Batalha</span>
              </button>
              <small className="ad-lobby-tip">
                Vitórias diárias rendem moedas e XP adicionais no seu extrato!
              </small>
            </div>
          )}

          {battle && battle.status !== 'fled' && (
            <div className="ad-arena-container">
              {/* Arena Battleground */}
              <div
                className="ad-arena-scene"
                style={{
                  backgroundImage: `url(${adventureAsset('forest.png', assetBase)})`,
                }}
              >
                {/* Enemy Combatant */}
                <div className="ad-combatant ad-combatant-enemy">
                  <div className="ad-combatant-card">
                    <span className="ad-combatant-name">{opponent.name}</span>
                    <small className="ad-combatant-meta">
                      Nível {opponent.level} · {LANGUAGE_NAMES[battle.language]}
                    </small>
                    <div className="ad-combatant-hp-bar">
                      <div
                        className="ad-hp-fill"
                        style={{ width: `${Math.max(0, battle.enemyHp)}%` }}
                      />
                    </div>
                    <span className="ad-hp-number">{battle.enemyHp} / 100 PV</span>
                  </div>
                  <PixelCreature kind={opponent.id} color={opponent.color} />
                </div>

                {/* Player Combatant */}
                <div className="ad-combatant ad-combatant-player">
                  <PixelAvatar avatar={equippedAvatar} direction="up" />
                  <div className="ad-combatant-card">
                    <span className="ad-combatant-name">{data?.username}</span>
                    <small className="ad-combatant-meta">Nível {xp.level}</small>
                    <div className="ad-combatant-hp-bar">
                      <div
                        className="ad-hp-fill is-player"
                        style={{ width: `${Math.max(0, battle.hp)}%` }}
                      />
                    </div>
                    <span className="ad-hp-number">{battle.hp} / 100 PV</span>
                  </div>
                </div>
              </div>

              {/* Console & Battle Turn Actions */}
              <div className="ad-battle-bottom-console">
                <p className="ad-battle-narrative">{battle.feedback}</p>

                {battle.status === 'active' ? (
                  battle.question ? (
                    <div className="ad-battle-question-box">
                      <span className="ad-concept-tag">
                        {battle.question.concept} · {battle.question.difficulty}
                      </span>
                      <h3 className="ad-question-text">{battle.question.prompt}</h3>
                      <div className="ad-answers-grid">
                        {battle.question.options.map((option, idx) => (
                          <button
                            key={idx}
                            disabled={busy}
                            className="ad-answer-btn"
                            onClick={() =>
                              void act({
                                type: 'battle-answer',
                                battle: battle.id,
                                turn: battle.turn,
                                question: battle.question!.id,
                                answer: idx,
                              })
                            }
                          >
                            <span className="ad-answer-letter">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="ad-answer-body">{option}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="ad-skills-grid">
                      {SKILLS.map((skill) => (
                        <button
                          key={skill.id}
                          disabled={busy}
                          className="ad-skill-card-btn"
                          onClick={() =>
                            void act({
                              type: 'battle-skill',
                              battle: battle.id,
                              turn: battle.turn,
                              skill: skill.id,
                            })
                          }
                        >
                          <Swords size={20} className="text-amber-400" />
                          <strong>{skill.name}</strong>
                          <small>{skill.description}</small>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="ad-battle-end-card">
                    <h2>
                      {battle.status === 'won'
                        ? '🎉 Vitória! Você dominou o conceito!'
                        : '💔 Batalha encerrada.'}
                    </h2>
                    <p>
                      {battle.status === 'won'
                        ? battle.reward
                          ? `+${battle.reward} moedas · +30 XP creditados no seu perfil!`
                          : 'Você venceu a batalha e praticou seus conhecimentos.'
                        : 'Revise o conceito e tente novamente! Suas lições continuam salvas.'}
                    </p>
                    <button className="ad-primary mt-4" onClick={() => go('home')}>
                      Voltar para Trilhas
                    </button>
                  </div>
                )}

                {battle.status === 'active' && (
                  <button
                    className="ad-flee-btn"
                    disabled={busy}
                    onClick={() => void act({ type: 'battle-flee', battle: battle.id })}
                  >
                    Recuar para a clareira
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. VIEW: STORE & INVENTORY (Section 7)                       */}
      {/* ============================================================ */}
      {(view === 'store' || view === 'inventory') && (
        <div className="ad-store-view">
          <div className="ad-store-top-bar">
            <span className="ad-store-balance">
              Saldo: <strong>{data?.coins.toLocaleString('pt-BR') ?? 0}</strong> <Coin />
            </span>
            <button
              className="ad-store-toggle-btn"
              onClick={() => go(view === 'store' ? 'inventory' : 'store')}
            >
              {view === 'store' ? 'Ver Meu Inventário' : 'Visitar a Loja'}
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="ad-store-grid">
            {ITEMS.filter((item) => view === 'store' || data?.inventory.includes(item.id)).map(
              (item) => {
                const owned = data?.inventory.includes(item.id);
                const worn = ['hair', 'outfit', 'accessory'].includes(item.category)
                  ? equippedAvatar[item.category as keyof Avatar] === item.value
                  : data?.equipped[item.category] === item.id;

                return (
                  <article key={item.id} className="ad-store-card">
                    <div className="ad-store-item-preview">
                      {item.category === 'title' ? (
                        <Crown size={48} className="text-amber-400" />
                      ) : (
                        <PixelAvatar
                          avatar={{
                            ...equippedAvatar,
                            ...(['outfit', 'hair', 'accessory'].includes(item.category)
                              ? { [item.category]: item.value }
                              : {}),
                          }}
                          effect={item.category === 'effect'}
                        />
                      )}
                    </div>
                    <small className="ad-item-rarity">{item.rarity}</small>
                    <h3 className="ad-item-name">{item.name}</h3>
                    <p className="ad-item-desc">{item.description}</p>

                    {owned ? (
                      <button
                        className={`ad-equip-btn ${worn ? 'is-worn' : ''}`}
                        disabled={busy}
                        onClick={() =>
                          void act(
                            { type: 'equip', item: item.id, remove: worn },
                            worn ? 'Item desequipado.' : 'Item equipado com sucesso!'
                          )
                        }
                      >
                        {worn ? 'Desequipar' : 'Equipar'}
                      </button>
                    ) : confirm === item.id ? (
                      <div className="ad-confirm-box">
                        <p>Confirmar por {item.price} moedas?</p>
                        <button
                          className="ad-primary w-full text-xs py-2"
                          disabled={busy}
                          onClick={async () => {
                            await act(
                              { type: 'buy', item: item.id },
                              'Item comprado e adicionado ao inventário!'
                            );
                            setConfirm(null);
                          }}
                        >
                          Confirmar
                        </button>
                        <button className="ad-cancel-text" onClick={() => setConfirm(null)}>
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        className="ad-buy-btn"
                        disabled={!data || busy || data.coins < item.price}
                        onClick={() => setConfirm(item.id)}
                      >
                        <Coin />
                        <span>{item.price}</span>
                        {data && data.coins < item.price && <small>(Saldo insuficiente)</small>}
                      </button>
                    )}
                  </article>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="ad-footer-badge">
        <Sparkles size={15} />
        <span>Stacklyst · Gamificação e Aprendizado de Programação</span>
      </footer>
    </div>
  );
}
