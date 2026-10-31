'use client';

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Backpack,
  Check,
  ChevronRight,
  Crown,
  Flame,
  Globe2,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  RotateCw,
  Shield,
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
  PackageOpen as TreasureChest,
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
import { canChallengeCreature, SKILLS } from '../../lib/mundinho/rules';
import { BattleAudio } from '../../lib/mundinho/battleAudio';
import { CodeBattle } from './CodeBattle';
import { BattleEffects, CREATURE_ELEMENTS } from './BattleEffects';
import { ColorPalette, PROFILE_COLORS } from '../ColorPalette';
import {
  avatarHairColor,
  LEGACY_HAIR_NAMES,
  NATURAL_HAIR_OPTIONS,
  withAvatarHairColor,
} from '../../lib/mundinho/hair-colors';
import { WORLD } from '../../lib/mundinho/world';
import { Coin, HAIR, OUTFIT, PixelAvatar, PixelCreature, SKIN } from './PixelArt';
import './mundinho.css';
import { adventureAsset } from './assets';
import { PixelMeter } from './PixelMeter';
import { Portrait } from './Portrait';

const World = lazy(() => import('./World'));
const hairColors = [
  ...new Set([...HAIR, ...NATURAL_HAIR_OPTIONS.map((item) => item.color), ...PROFILE_COLORS]),
];
const hairColorNames = hairColors.map(
  (color) =>
    LEGACY_HAIR_NAMES[HAIR.indexOf(color)] ??
    NATURAL_HAIR_OPTIONS.find((item) => item.color === color)?.name ??
    color
);

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
  soundPreference,
  onSoundPreferenceChange,
  languagePreference,
  onLanguageChange,
}: {
  transport: AdventureTransport;
  courses: Course[];
  onCourse: (language?: string) => void;
  assetBase?: string;
  soundPreference?: boolean;
  onSoundPreferenceChange?: (enabled: boolean) => void;
  languagePreference?: (typeof LANGUAGES)[number];
  onLanguageChange?: (language: (typeof LANGUAGES)[number]) => void;
}) {
  const [data, setData] = useState<AdventureState | null>(null);
  const [view, setView] = useState<View>('home');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [combatPhase, setCombatPhase] = useState('idle');
  const [impact, setImpact] = useState(0);
  const [attackEffect, setAttackEffect] = useState('strike');
  const [incomingDamage, setIncomingDamage] = useState(0);
  const [healing, setHealing] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState(0);
  const skillButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const [battleAudio] = useState(() => new BattleAudio());
  const [soundEnabled, setSoundEnabled] = useState(true);
  useEffect(() => {
    const sync = () => {
      let enabled = true;
      try {
        enabled = localStorage.getItem('stacklyst-sound') !== 'false';
      } catch {}
      enabled = soundPreference ?? enabled;
      setSoundEnabled(enabled);
      battleAudio.setEnabled(enabled);
    };
    sync();
    window.addEventListener('stacklyst-sound-changed', sync);
    const visibility = () => battleAudio.setForeground(document.visibilityState === 'visible');
    visibility();
    document.addEventListener('visibilitychange', visibility);
    const nativeVisibility = (event: Event) =>
      battleAudio.setForeground(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener('mundinho-foreground', nativeVisibility);
    return () => {
      window.removeEventListener('stacklyst-sound-changed', sync);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('mundinho-foreground', nativeVisibility);
    };
  }, [battleAudio, soundPreference]);
  useEffect(() => () => battleAudio.dispose(), [battleAudio]);
  const toggleBattleSound = () => {
    const enabled = !soundEnabled;
    setSoundEnabled(enabled);
    battleAudio.setEnabled(enabled);
    if (enabled) battleAudio.unlock();
    try {
      localStorage.setItem('stacklyst-sound', String(enabled));
      // Native preferences arrive through the bridge after the tap; do not
      // immediately restore the previous prop while that update is pending.
      if (soundPreference === undefined) window.dispatchEvent(new Event('stacklyst-sound-changed'));
    } catch {}
    onSoundPreferenceChange?.(enabled);
  };

  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>(
    languagePreference ?? 'PYTHON'
  );
  useEffect(() => {
    if (languagePreference) setLanguage(languagePreference);
  }, [languagePreference]);
  const [creature, setCreature] = useState(CREATURES[0].id);

  // Avatar Editor State
  const [draft, setDraft] = useState<Avatar>(DEFAULT_AVATAR);
  const [category, setCategory] = useState<Exclude<keyof Avatar, 'hairTint' | 'gender'>>('skin');
  const [direction, setDirection] = useState(0); // 0: down, 1: right, 2: up, 3: left
  const [confirm, setConfirm] = useState<string | null>(null);

  const heading = useRef<HTMLHeadingElement>(null);
  const pending = useRef(false);
  const stateRevision = useRef(0);
  const worldPosition = useRef({ ...WORLD.spawn });

  const load = useCallback(async () => {
    if (pending.current) return;
    const revision = stateRevision.current;
    try {
      const next = await transport();
      if (pending.current || stateRevision.current !== revision) return;
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
    if (next === 'battle') setSelectedSkill(0);
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
    stateRevision.current++;
    pending.current = true;
    battleAudio.unlock();
    if (action.type === 'battle-skill') battleAudio.play('select');
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const next = await transport(action);
      const answered =
        action.type === 'battle-answer' || (action.type === 'battle-code' && action.submit);
      if (answered && data?.battle && next.battle) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const pause = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, reduced ? 0 : ms));
        setImpact(data.battle.enemyHp - next.battle.enemyHp);
        const skill = SKILLS.find((item) => item.id === data.battle?.skill) ?? SKILLS[0];
        const landed = next.battle.enemyHp < data.battle.enemyHp;
        setAttackEffect(skill.id);
        setHealing(landed ? Math.max(0, Math.min(100 - data.battle.hp, skill.heal)) : 0);
        const recoveredHp = landed ? Math.min(100, data.battle.hp + skill.heal) : data.battle.hp;
        const counterDamage = Math.max(0, recoveredHp - next.battle.hp);
        setIncomingDamage(counterDamage);
        battleAudio.play('attack');
        setCombatPhase('player-attack');
        await pause(350);
        battleAudio.play(next.battle.enemyHp < data.battle.enemyHp ? 'hit' : 'miss');
        if (landed && skill.heal > 0) battleAudio.play('heal');
        setCombatPhase(next.battle.enemyHp < data.battle.enemyHp ? 'enemy-hurt' : 'miss');
        await pause(450);
        if (counterDamage > 0 && next.battle.enemyHp > 0) {
          setCombatPhase('enemy-attack');
          await pause(350);
          battleAudio.play('hurt');
          setCombatPhase('player-hurt');
          await pause(350);
        }
        setCombatPhase(
          next.battle.status === 'won'
            ? 'victory'
            : next.battle.status === 'lost'
              ? 'defeat'
              : 'idle'
        );
      }
      if (answered && next.battle?.status === 'won') battleAudio.play('victory');
      if (answered && next.battle?.status === 'lost') battleAudio.play('defeat');
      if (action.type === 'battle-start') battleAudio.play('encounter');
      if (action.type === 'battle-flee') {
        if (next.battle?.status !== 'fled')
          throw new Error('Não foi possível fugir. Tente novamente.');
        battleAudio.play('flee');
        setCombatPhase('flee');
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
          await new Promise((resolve) => setTimeout(resolve, 600));
        setData(next);
        go('world');
        setCombatPhase('idle');
        return next;
      }
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
  const choosingSkill = view === 'battle' && battle?.status === 'active' && !battle.question;
  useEffect(() => {
    if (!choosingSkill || busy) return;
    const focused = document.activeElement;
    if (!focused || focused === document.body || focused === heading.current)
      skillButtons.current[selectedSkill]?.focus({ preventScroll: true });
  }, [choosingSkill, busy, selectedSkill]);
  useEffect(() => {
    battleAudio.setBattle(view === 'battle' && battle?.status === 'active');
    battleAudio.setWorld(view === 'world');
    return () => {
      battleAudio.setBattle(false);
      battleAudio.setWorld(false);
    };
  }, [battleAudio, view, battle?.status]);
  useEffect(() => {
    if (view !== 'battle' || battle?.status !== 'won') return;
    const reward = battle.reward;
    const timer = setTimeout(() => {
      go('world');
      setNotice(
        reward
          ? `Vitória! +${reward} moedas e +30 XP. Recompensa registrada.`
          : 'Vitória! Você voltou à clareira.'
      );
      setCombatPhase('idle');
    }, 2000);
    return () => clearTimeout(timer);
    // Only the confirmed battle result owns this timer; changing screens cancels it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, battle?.id, battle?.status]);

  const startBattle = async (selectedLang = language, selectedCreature = creature) => {
    setCombatPhase('idle');
    const next = await act({
      type: 'battle-start',
      language: selectedLang,
      creature: selectedCreature,
    });
    if (next) go('battle');
  };

  const handleBattleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      view !== 'battle' ||
      battle?.status !== 'active' ||
      battle.question ||
      busy ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]'))
      return;
    const button = target?.closest('button');
    if (button && !button.classList.contains('ad-skill-card-btn')) return;
    const key = event.key.toLowerCase();
    const previous = ['arrowleft', 'arrowup', 'a', 'w'].includes(key);
    const next = ['arrowright', 'arrowdown', 'd', 's'].includes(key);
    if (previous || next || key === 'home' || key === 'end') {
      event.preventDefault();
      event.stopPropagation();
      const index =
        key === 'home'
          ? 0
          : key === 'end'
            ? SKILLS.length - 1
            : (selectedSkill + (previous ? -1 : 1) + SKILLS.length) % SKILLS.length;
      setSelectedSkill(index);
      skillButtons.current[index]?.focus({ preventScroll: true });
      battleAudio.play('select');
    } else if (key === 'enter' || key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      if (event.repeat) return;
      void act({
        type: 'battle-skill',
        battle: battle.id,
        turn: battle.turn,
        skill: SKILLS[selectedSkill].id,
      });
    }
  };

  return (
    <div
      className={`adventure adventure-${view}`}
      onPointerDownCapture={() => battleAudio.unlock()}
      onKeyDownCapture={() => battleAudio.unlock()}
      onKeyDown={handleBattleKeyDown}
    >
      {/* HEADER BAR */}
      <header className="ad-page-heading">
        {view !== 'home' ? (
          <button
            className="ad-back-button"
            aria-label={view === 'battle' ? 'Voltar ao Mundinho' : 'Voltar para a tela inicial'}
            disabled={busy}
            onClick={() => {
              if (view === 'battle' && battle?.status === 'active')
                void act({ type: 'battle-flee', battle: battle.id });
              else go(view === 'battle' ? 'world' : 'home');
            }}
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

        {(view === 'world' || view === 'battle') && (
          <button
            className="ad-battle-sound"
            aria-label={soundEnabled ? 'Silenciar sons do jogo' : 'Ativar sons do jogo'}
            aria-pressed={soundEnabled}
            onClick={toggleBattleSound}
          >
            {soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>
        )}
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
              backgroundImage: `url(${adventureAsset('forest-v2.png', assetBase)})`,
            }}
          >
            <div className="ad-hero-overlay" />
            <div className="ad-hero-avatar-center">
              <PixelAvatar avatar={equippedAvatar} effect={Boolean(data?.equipped.effect)} />
            </div>

            <label className="ad-home-language">
              Linguagem do Mundinho
              <select
                value={language}
                onChange={(event) => {
                  const selected = event.target.value as typeof language;
                  setLanguage(selected);
                  onLanguageChange?.(selected);
                }}
              >
                {LANGUAGES.map((item) => (
                  <option key={item} value={item}>
                    {LANGUAGE_NAMES[item]}
                  </option>
                ))}
              </select>
            </label>
            <div className="ad-hero-buttons-row">
              <button
                className="ad-enter-world-button"
                aria-label="Entrar no Mundinho"
                onClick={() => go('world')}
              >
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

          <section className="ad-portrait-editor" aria-label="Retrato de diálogo">
            <Portrait
              avatar={draft}
              name={data?.username ?? 'Seu personagem'}
              assetBase={assetBase}
            />
            <div>
              <h2>Seu retrato nas conversas</h2>
              <p>Pele, olhos, cabelo, roupas e acessórios acompanham suas escolhas.</p>
              <fieldset className="ad-gender-picker">
                <legend>Gênero do personagem</legend>
                {(
                  [
                    { value: 'masculine', label: 'Masculino' },
                    { value: 'feminine', label: 'Feminino' },
                  ] as const
                ).map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name="portrait-gender"
                      value={option.value}
                      checked={(draft.gender ?? 'masculine') === option.value}
                      onChange={() => setDraft({ ...draft, gender: option.value })}
                    />
                    {option.label}
                  </label>
                ))}
              </fieldset>
              <p className="ad-portrait-note">
                Define a silhueta do retrato. Todas as peças podem ser usadas nas duas opções.
              </p>
            </div>
          </section>

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
                onClick={() => setCategory(tab.id as Exclude<keyof Avatar, 'hairTint' | 'gender'>)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {category === 'hair' && (
            <section className="ad-hair-colors" aria-label="Cor do cabelo">
              <h2>Cor do cabelo</h2>
              <ColorPalette
                aria-label="Cor do cabelo"
                colors={hairColors}
                names={hairColorNames}
                value={avatarHairColor(draft)}
                onChange={(event) => setDraft(withAvatarHairColor(draft, event.target.value))}
              />
            </section>
          )}
          {/* 3-Column Grid of Avatar Options (Matching Image 4) */}
          <div className="ad-options-grid-three">
            {Array.from(
              {
                length:
                  {
                    skin: SKIN.length,
                    eyes: 5,
                    hair: 6,
                    hairColor: HAIR.length,
                    outfit: OUTFIT.length,
                    accessory: 6,
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
                      <PixelAvatar
                        avatar={
                          category === 'skin'
                            ? { ...draft, skin: i, hair: -1, outfit: -1, accessory: 0 }
                            : { ...draft, [category]: i }
                        }
                      />
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
            playerLevel={xp.level}
            initialPosition={worldPosition.current}
            onPositionChange={(position) => {
              worldPosition.current = position;
            }}
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
          {(!battle || battle.status === 'fled') && (
            <div className="ad-battle-lobby">
              <div className="ad-lobby-header">
                <h2>Prepare sua aventura</h2>
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
                    onChange={(e) => {
                      const selected = e.target.value as typeof language;
                      setLanguage(selected);
                      onLanguageChange?.(selected);
                    }}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {LANGUAGE_NAMES[l]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                className="ad-start-battle-btn"
                disabled={!data || busy}
                onClick={() => go('world')}
              >
                <Swords size={22} />
                <span>Explorar o Mundinho</span>
              </button>
              <small className="ad-lobby-tip">
                Encontre uma criatura na clareira. Você pode enfrentar criaturas de nível igual ou
                inferior ao seu.
              </small>
              <div className="ad-encounter-levels" aria-label="Níveis das criaturas">
                {CREATURES.map((c) => (
                  <article
                    key={c.id}
                    className={canChallengeCreature(xp.level, c.level) ? '' : 'is-locked'}
                  >
                    <PixelCreature kind={c.id} />
                    <div>
                      <strong>{c.name}</strong>
                      <span>
                        Nível {c.level} ·{' '}
                        {canChallengeCreature(xp.level, c.level)
                          ? 'Pode enfrentar'
                          : `Requer nível ${c.level}`}
                      </span>
                      <PixelMeter label={`Vida de ${c.name}`} value={100} compact />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {battle && battle.status !== 'fled' && (
            <div className="ad-arena-container">
              {/* Arena Battleground */}
              <div
                className={`ad-arena-scene combat-${combatPhase}`}
                style={{
                  backgroundImage: `url(${adventureAsset('forest-v2.png', assetBase)})`,
                }}
              >
                {/* Enemy Combatant */}
                <div className="ad-combatant ad-combatant-enemy">
                  <div className="ad-combatant-card">
                    <span className="ad-combatant-name">{opponent.name}</span>
                    <small className="ad-combatant-meta">
                      Nível {opponent.level} · {LANGUAGE_NAMES[battle.language]}
                    </small>
                    <PixelMeter value={battle.enemyHp} label={`Vida de ${opponent.name}`} />
                    <span className="ad-hp-number">{battle.enemyHp} / 100 PV</span>
                  </div>
                  <div className="battle-sprite battle-sprite-enemy">
                    <PixelCreature kind={opponent.id} color={opponent.color} />
                    {combatPhase === 'enemy-attack' && (
                      <BattleEffects
                        kind={CREATURE_ELEMENTS[opponent.id]?.element ?? 'slime'}
                        stage="cast"
                      />
                    )}
                    {combatPhase === 'enemy-hurt' && (
                      <>
                        <BattleEffects kind={attackEffect} stage="impact" />
                        <span className="combat-damage" aria-hidden="true">
                          −{impact}
                        </span>
                      </>
                    )}
                    {combatPhase === 'miss' && (
                      <span className="battle-miss" aria-hidden="true">
                        Errou
                      </span>
                    )}
                  </div>
                </div>

                {/* Player Combatant */}
                <div className="ad-combatant ad-combatant-player">
                  <div className="battle-sprite battle-sprite-player">
                    <PixelAvatar
                      avatar={equippedAvatar}
                      direction={combatPhase === 'flee' ? 'left' : 'right'}
                      walking={combatPhase === 'flee'}
                      motion={
                        combatPhase === 'player-attack'
                          ? 'attack'
                          : combatPhase === 'player-hurt'
                            ? 'hurt'
                            : combatPhase === 'victory'
                              ? 'victory'
                              : 'idle'
                      }
                    />
                    {combatPhase === 'player-attack' && (
                      <BattleEffects kind={attackEffect} stage="cast" />
                    )}
                    {combatPhase === 'enemy-hurt' && healing > 0 && (
                      <>
                        <BattleEffects kind="focus" stage="heal" />
                        <span className="combat-damage battle-heal" aria-hidden="true">
                          +{healing}
                        </span>
                      </>
                    )}
                    {combatPhase === 'player-hurt' && (
                      <>
                        <BattleEffects
                          kind={CREATURE_ELEMENTS[opponent.id]?.element ?? 'slime'}
                          stage="impact"
                        />
                        <span className="combat-damage battle-damage-player" aria-hidden="true">
                          −{incomingDamage}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="ad-combatant-card">
                    <span className="ad-combatant-name">{data?.username}</span>
                    <small className="ad-combatant-meta">Nível {xp.level}</small>
                    <PixelMeter
                      value={battle.hp}
                      label={`Vida de ${data?.username ?? 'jogador'}`}
                    />
                    <span className="ad-hp-number">{battle.hp} / 100 PV</span>
                  </div>
                </div>
              </div>

              {/* Console & Battle Turn Actions */}
              <div className="ad-battle-bottom-console">
                <p className="ad-battle-narrative" role="status" aria-live="polite">
                  {combatPhase === 'flee'
                    ? 'Você fugiu. Voltando para a clareira…'
                    : battle.feedback}
                </p>

                {battle.status === 'active' ? (
                  battle.question?.code ? (
                    <CodeBattle
                      key={`${battle.id}:${battle.question.id}`}
                      question={battle.question}
                      battleLanguage={battle.language}
                      avatar={equippedAvatar}
                      busy={busy}
                      onExecute={(code, submit) =>
                        act({
                          type: 'battle-code',
                          battle: battle.id,
                          turn: battle.turn,
                          question: battle.question!.id,
                          code,
                          submit,
                        })
                      }
                    />
                  ) : battle.question ? (
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
                    <>
                      <div
                        className="ad-skills-grid"
                        role="toolbar"
                        aria-label="Ações de batalha"
                        aria-orientation="horizontal"
                      >
                        {SKILLS.map((skill, index) => (
                          <button
                            key={skill.id}
                            disabled={busy}
                            className="ad-skill-card-btn"
                            ref={(element) => {
                              skillButtons.current[index] = element;
                            }}
                            tabIndex={selectedSkill === index ? 0 : -1}
                            data-selected={selectedSkill === index}
                            onFocus={() => setSelectedSkill(index)}
                            onClick={() => {
                              setSelectedSkill(index);
                              void act({
                                type: 'battle-skill',
                                battle: battle.id,
                                turn: battle.turn,
                                skill: skill.id,
                              });
                            }}
                          >
                            <span className="rpg-selection-cursor" aria-hidden="true" />
                            <strong>{skill.name}</strong>
                            <small>{skill.description}</small>
                          </button>
                        ))}
                      </div>
                      <p className="rpg-command-hint">
                        WASD / setas: selecionar · Enter / Espaço: confirmar
                      </p>
                    </>
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
                    {battle.status === 'won' && (
                      <p role="status">Voltando ao Mundinho em instantes…</p>
                    )}
                    <button className="ad-primary mt-4" onClick={() => go('world')}>
                      Voltar ao Mundinho
                    </button>
                  </div>
                )}

                {battle.status === 'active' && (
                  <button
                    className="ad-flee-btn"
                    disabled={busy}
                    onClick={() => void act({ type: 'battle-flee', battle: battle.id })}
                  >
                    Fugir
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
