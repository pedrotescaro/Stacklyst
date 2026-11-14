'use client';

import { useLocalizedText } from '../../i18n/useLocalizedText';
import { translateMundinho } from '../../lib/mundinho/i18n';
import HAIRSTYLES from '../../lib/mundinho/hairstyles.json';
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
import { Coin, HAIR, OUTFIT, OUTFIT_SPECS, PixelAvatar, PixelCreature, SKIN } from './PixelArt';
import './mundinho.css';
import { adventureAsset } from './assets';
import { PixelMeter } from './PixelMeter';
import { Portrait } from './Portrait';
import {
  EQUIPMENT,
  equipmentStats,
  equipmentBonusLabel,
  hasBugHunterTitle,
  BUG_HUNTER_TITLE_ID,
} from '../../lib/mundinho/equipment';
import { EquipmentInventory } from './EquipmentInventory';
import { EquipmentStore } from './EquipmentStore';
import { EquipmentSprite } from './EquipmentSprite';
import { MultiplayerArena } from './MultiplayerArena';
import type { ArenaInvitation, ArenaState, ArenaTransport } from '../../lib/mundinho/arena-types';

import { VeilBoss } from './VeilBoss';
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
  | 'boss'
  | 'home'
  | 'world'
  | 'arena'
  | 'battle'
  | 'avatar'
  | 'wallet'
  | 'store'
  | 'inventory'
  | 'recharge'
  | 'missions'
  | 'profile';

const TITLES: Record<View, string> = {
  boss: 'Guardião da Fenda',
  home: 'Trilhas de aprendizagem',
  world: 'Meu Mundinho',
  arena: 'Arena multiplayer',
  battle: 'Batalha de Conceitos',
  avatar: 'Avatar',
  wallet: 'Moedas',
  store: 'Loja de Itens',
  inventory: 'Meu Inventário',
  recharge: 'Recarga',
  missions: 'Missões Diárias',
  profile: 'Perfil de Aventureiro',
};

const TITLES_EN: Record<View, string> = {
  boss: 'Rift Guardian',
  home: 'Learning trails',
  world: 'My World',
  arena: 'Multiplayer arena',
  battle: 'Concept Battle',
  avatar: 'Avatar',
  wallet: 'Coins',
  store: 'Item Store',
  inventory: 'My Inventory',
  recharge: 'Top up',
  missions: 'Daily Missions',
  profile: 'Adventurer Profile',
};

function formatTransactionDate(iso: string, language: 'pt' | 'en' = 'pt') {
  try {
    const d = new Date(iso);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const months =
      language === 'en'
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        : [
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
  const { text, language: uiLanguage, locale } = useLocalizedText();
  const m = useCallback((value: string) => translateMundinho(value, uiLanguage), [uiLanguage]);
  const [data, setData] = useState<AdventureState | null>(null);
  const [view, setView] = useState<View>('home');
  const [arenaSeed, setArenaSeed] = useState<ArenaState | null>(null);
  const [arenaInvitations, setArenaInvitations] = useState<ArenaInvitation[]>([]);
  const arenaTransport = useCallback<ArenaTransport>(
    async (action) => {
      return (await transport({ type: 'arena', action })) as unknown as ArenaState;
    },
    [transport]
  );
  useEffect(() => {
    if (view === 'arena') return;
    let cancelled = false;
    let querying = false;
    const refreshInvites = async () => {
      if (querying || document.visibilityState !== 'visible') return;
      querying = true;
      try {
        const next = await arenaTransport({ type: 'inbox' });
        if (!cancelled && Array.isArray(next.invitations)) setArenaInvitations(next.invitations);
      } catch {
      } finally {
        querying = false;
      }
    };
    const timer = setInterval(() => void refreshInvites(), 8000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [view, arenaTransport]);
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
      if (pending.current || stateRevision.current !== revision) return;
      setError(
        e instanceof Error
          ? e.message
          : text(
              'Não foi possível carregar o Mundinho. Tente novamente.',
              'Could not load Mundinho. Try again.'
            )
      );
    }
  }, [transport, text]);

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
    battleAudio.setScene(next);
    if (view === 'arena' && next === 'world') worldPosition.current = { x: 600, y: 490 };
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
        !next.notice &&
        (action.type === 'battle-answer' ||
          (action.type === 'battle-code' && action.submit && !next.codeRun?.retryable) ||
          ((action.type === 'battle-skill' || action.type === 'battle-skip') &&
            data?.battle?.id === next.battle?.id &&
            (next.battle?.turn ?? 0) > (data?.battle?.turn ?? 0)));
      if (answered && data?.battle && next.battle) {
        const resolvedBattle = next.battle;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const pause = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, reduced ? 0 : ms));
        setImpact(data.battle.enemyHp - next.battle.enemyHp);
        const skill =
          SKILLS.find(
            (item) =>
              item.id === (action.type === 'battle-skill' ? action.skill : data.battle?.skill)
          ) ?? SKILLS[0];
        const maxHp = data.battle.maxHp ?? data.combatStats?.maxHp ?? 100;
        const landed = next.battle.enemyHp < data.battle.enemyHp;
        setAttackEffect(skill.id);
        setHealing(landed ? Math.max(0, Math.min(maxHp - data.battle.hp, skill.heal)) : 0);
        const recoveredHp = Math.max(
          0,
          landed ? Math.min(maxHp, data.battle.hp + skill.heal) : data.battle.hp
        );
        const counterDamage = Math.max(0, recoveredHp - next.battle.hp);
        setIncomingDamage(counterDamage);
        // The response already confirms the turn. Present its damage/healing at
        // contact while keeping the remaining turn fields locked until recovery.
        const showBattleHealth = (hp: number) =>
          setData((current) => {
            if (!current?.battle || current.battle.id !== resolvedBattle.id) return current;
            return {
              ...current,
              battle: { ...current.battle, enemyHp: resolvedBattle.enemyHp, hp },
            };
          });
        battleAudio.play('attack');
        setCombatPhase('player-attack');
        await pause(350);
        battleAudio.play(next.battle.enemyHp < data.battle.enemyHp ? 'hit' : 'miss');
        if (landed && skill.heal > 0) battleAudio.play('heal');
        showBattleHealth(recoveredHp);
        setCombatPhase(next.battle.enemyHp < data.battle.enemyHp ? 'enemy-hurt' : 'miss');
        await pause(450);
        if (counterDamage > 0 && next.battle.enemyHp > 0) {
          setCombatPhase('enemy-attack');
          await pause(350);
          battleAudio.play('hurt');
          showBattleHealth(resolvedBattle.hp);
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
      if (next.notice) setNotice(next.notice);
      else if (success) setNotice(success);
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
      setNotice(text('Tocando rádio de estudos lo-fi.', 'Playing lo-fi study radio.'));
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
  const combatStats =
    data?.combatStats ?? equipmentStats(data?.inventory ?? [], data?.equipped ?? {});
  const bugHunter = hasBugHunterTitle(data?.inventory ?? [], data?.equipped ?? {});
  const battleDrop = EQUIPMENT.find((item) => item.id === battle?.drop?.itemId);
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
    const timer = setTimeout(
      () => {
        go('world');
        const drop = EQUIPMENT.find((item) => item.id === battle.drop?.itemId);
        const dropName = drop ? m(drop.name) : '';
        const dropText = drop
          ? battle.drop?.duplicateCoins
            ? text(
                ` ${dropName} repetido: +${battle.drop.duplicateCoins} moedas.`,
                ` Duplicate ${dropName}: +${battle.drop.duplicateCoins} coins.`
              )
            : text(
                ` ${dropName} foi guardado no inventário!`,
                ` ${dropName} was stored in your inventory!`
              )
          : '';
        setNotice(
          (reward
            ? text(
                `Vitória! +${reward} moedas e +30 XP. Recompensa registrada.`,
                `Victory! +${reward} coins and +30 XP. Reward recorded.`
              )
            : text('Vitória! Você voltou à clareira.', 'Victory! You returned to the clearing.')) +
            dropText
        );
        setCombatPhase('idle');
      },
      battle.drop ? 6000 : 2000
    );
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
  const acceptArenaInvite = async (roomId: string) => {
    if (pending.current) return;
    pending.current = true;
    stateRevision.current++;
    setBusy(true);
    try {
      const next = await arenaTransport({ type: 'accept', roomId, language });
      setArenaSeed(next);
      setArenaInvitations([]);
      go('arena');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : text('Não foi possível aceitar o convite.', 'Could not accept the invitation.')
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
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
            aria-label={
              view === 'battle' || view === 'arena' || view === 'boss'
                ? text('Voltar ao Mundinho', 'Back to the World')
                : text('Voltar para a tela inicial', 'Back to the home screen')
            }
            disabled={busy}
            onClick={() => {
              if (view === 'battle' && battle?.status === 'active')
                void act({ type: 'battle-flee', battle: battle.id });
              else go(view === 'battle' || view === 'arena' || view === 'boss' ? 'world' : 'home');
            }}
          >
            <ArrowLeft size={22} />
          </button>
        ) : null}

        <div className="ad-heading-text">
          <h1 tabIndex={-1} ref={heading}>
            {text(TITLES[view], TITLES_EN[view])}
          </h1>
          {view === 'home' && (
            <p className="ad-subtitle">
              {text(
                'Aprenda programação de forma gamificada e divertida.',
                'Learn programming in a fun, gamified way.'
              )}
            </p>
          )}
        </div>

        {(view === 'world' || view === 'battle' || view === 'boss') && (
          <button
            className="ad-battle-sound"
            aria-label={
              soundEnabled
                ? text('Silenciar sons do jogo', 'Mute game sounds')
                : text('Ativar sons do jogo', 'Turn on game sounds')
            }
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
            title={text('Acessar mapa completo de lições', 'Open the full lesson map')}
          >
            {text('Mapa de Lições', 'Lesson map')} <ArrowRight size={16} />
          </button>
        )}

        {view === 'avatar' && (
          <button
            className="ad-save-pill"
            disabled={busy || !data}
            onClick={() =>
              void act(
                { type: 'avatar', avatar: draft },
                text(
                  'Avatar salvo! Visual atualizado no mundo e nas batalhas.',
                  'Avatar saved! Look updated in the world and in battles.'
                )
              )
            }
          >
            {busy ? text('Salvando…', 'Saving…') : text('Salvar', 'Save')}
          </button>
        )}
      </header>

      {view !== 'arena' &&
        arenaInvitations.map((invite) => (
          <div className="ad-arena-invitation" role="status" key={invite.roomId}>
            <Swords size={20} />
            <p>
              <strong>{invite.hostName}</strong>{' '}
              {text('convidou você para a arena do Mundinho.', 'invited you to the World arena.')}
            </p>
            <button
              type="button"
              disabled={busy || (view === 'battle' && battle?.status === 'active')}
              onClick={() => void acceptArenaInvite(invite.roomId)}
            >
              {text('Aceitar e entrar', 'Accept and join')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                void arenaTransport({ type: 'decline', roomId: invite.roomId })
                  .then(() =>
                    setArenaInvitations((items) => items.filter((i) => i.roomId !== invite.roomId))
                  )
                  .catch((e) => setError(e.message));
              }}
            >
              {text('Recusar', 'Decline')}
            </button>
          </div>
        ))}

      {/* ERROR & SUCCESS NOTICES */}
      {error && (
        <div className="ad-error" role="alert">
          <span>{error}</span>
          <button onClick={() => void load()}>{text('Tentar novamente', 'Try again')}</button>
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
            aria-label={text('Prévia do Meu Mundinho', 'My World preview')}
            style={{
              backgroundImage: `url(${adventureAsset('blue-clearing.png', assetBase)})`,
            }}
          >
            <div className="ad-hero-overlay" />
            <div className="ad-hero-avatar-center">
              <PixelAvatar avatar={equippedAvatar} effect={Boolean(data?.equipped.effect)} />
            </div>

            <label className="ad-home-language">
              {text('Linguagem do Mundinho', 'World language')}
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
                aria-label={text('Entrar no Mundinho', 'Enter the World')}
                onClick={() => go('world')}
              >
                <Globe2 size={22} />
                <span>{text('Entrar no Mundinho', 'Enter the World')}</span>
              </button>
              <button
                className="ad-hero-pencil-button"
                aria-label={text('Personalizar avatar', 'Customize avatar')}
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
              title={text('Ver extrato de moedas', 'View coin history')}
            >
              <span className="ad-stat-title">{text('Moedas', 'Coins')}</span>
              <div className="ad-stat-value-row">
                <span className="ad-stat-number">
                  {data ? data.coins.toLocaleString(locale) : '0'}
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
              title={text('Sequência de dias', 'Day streak')}
            >
              <span className="ad-stat-title">{text('Sequência', 'Streak')}</span>
              <div className="ad-stat-value-row">
                <Flame size={20} className="text-blue-400 fill-blue-400" />
                <span className="ad-stat-number">
                  {data ? data.checkin.streak : 0}{' '}
                  {data?.checkin.streak === 1 ? text('dia', 'day') : text('dias', 'days')}
                </span>
              </div>
            </button>
          </div>

          {/* Radio Player Card (Matching Image 1) */}
          <div className="ad-radio-card" onClick={toggleRadio}>
            <button
              className={`ad-radio-play-btn ${radioPlaying ? 'is-playing' : ''}`}
              aria-label={
                radioPlaying
                  ? text('Pausar rádio', 'Pause radio')
                  : text('Ouvir rádio', 'Play radio')
              }
            >
              {radioPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
            </button>
            <div className="ad-radio-info">
              <span>
                {radioPlaying
                  ? text('Tocando rádio de estudos lo-fi', 'Playing lo-fi study radio')
                  : text('Toque para ouvir o rádio', 'Tap to listen to the radio')}
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
              <strong>
                {text('Nível', 'Level')} {data ? xp.level : 1}
              </strong>
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
                      {isToday
                        ? data?.checkin.claimed
                          ? text('Resgatado', 'Claimed')
                          : text('Hoje', 'Today')
                        : `${text('Dia', 'Day')} ${i + 1}`}
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
                  text(
                    `Check-in realizado com sucesso! +${data?.checkin.reward} moedas adicionadas.`,
                    `Checked in! +${data?.checkin.reward} coins added.`
                  )
                )
              }
            >
              {data?.checkin.claimed ? (
                <>
                  <Check size={20} strokeWidth={3} />
                  <span>{text('Check-in de hoje realizado', "Today's check-in done")}</span>
                </>
              ) : busy ? (
                text('Resgatando moedas…', 'Claiming coins…')
              ) : (
                text('Fazer check-in', 'Check in')
              )}
            </button>
          </section>

          {/* Daily Missions (Matching Image 1) */}
          <section className="ad-missions-section">
            <h2 className="ad-section-title">{text('Missões diárias', 'Daily missions')}</h2>
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
                const tagLabel =
                  idx === 0
                    ? text('Fácil', 'Easy')
                    : idx === 1
                      ? text('Médio', 'Medium')
                      : text('Lendário', 'Legendary');
                return (
                  <article key={m.id} className="ad-mission-item">
                    <div className="ad-mission-header">
                      <span className={`ad-mission-tag tag-${tag.toLowerCase()}`}>{tagLabel}</span>
                      <span className="ad-mission-progress-badge">
                        {m.progress} / {m.target}
                      </span>
                    </div>
                    <div className="ad-mission-body">
                      <p className="ad-mission-name">{translateMundinho(m.name, uiLanguage)}</p>
                      <div className="ad-mission-reward-row">
                        <span className="ad-mission-reward">
                          <Coin /> +{m.reward} {text('moedas', 'coins')}
                        </span>
                        <button
                          className="ad-claim-mission-btn"
                          disabled={busy || m.claimed || m.progress < m.target}
                          onClick={() =>
                            void act(
                              { type: 'mission', mission: m.id },
                              text('Missão resgatada com sucesso!', 'Mission claimed!')
                            )
                          }
                        >
                          {m.claimed ? text('Resgatado', 'Claimed') : text('Resgatar', 'Claim')}
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
              <h2 className="ad-section-title">
                {text('Trilhas de Aprendizagem', 'Learning Trails')}
              </h2>
              <button className="ad-see-all-btn" onClick={() => onCourse()}>
                {text('Ver todas', 'See all')} <ChevronRight size={16} />
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

          {/* Quick Shortcuts to Features */}
          <div className="ad-shortcuts-grid">
            <button className="ad-shortcut-btn" onClick={() => go('battle')}>
              <Swords className="text-sky-400" size={24} />
              <div>
                <strong>{text('Batalhas de Conceitos', 'Concept Battles')}</strong>
                <small>
                  {text('Duelo de perguntas e habilidades', 'Question and skill duels')}
                </small>
              </div>
              <ChevronRight size={18} />
            </button>

            <button className="ad-shortcut-btn" onClick={() => go('avatar')}>
              <PixelAvatar avatar={equippedAvatar} />
              <div>
                <strong>{text('Personalizar Avatar', 'Customize Avatar')}</strong>
                <small>
                  {text('Roupas, cabelos e acessórios', 'Outfits, hair and accessories')}
                </small>
              </div>
              <ChevronRight size={18} />
            </button>

            <button className="ad-shortcut-btn" onClick={() => go('store')}>
              <TreasureChest className="text-amber-400" size={24} />
              <div>
                <strong>{text('Loja de Itens', 'Item Store')}</strong>
                <small>
                  {text(
                    'Equipamentos e cosméticos com suas moedas',
                    'Equipment and cosmetics with your coins'
                  )}
                </small>
              </div>
              <ChevronRight size={18} />
            </button>

            <button className="ad-shortcut-btn" onClick={() => go('inventory')}>
              <Backpack className="text-indigo-400" size={24} />
              <div>
                <strong>{text('Meu Inventário', 'My Inventory')}</strong>
                <small>
                  {text(
                    'Equipar itens, títulos e acessórios',
                    'Equip items, titles and accessories'
                  )}
                </small>
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
              <span className="ad-balance-label">{text('Saldo atual', 'Current balance')}</span>
              <div className="ad-balance-amount-row">
                <strong className="ad-balance-number">
                  {data ? data.coins.toLocaleString(locale) : '0'}
                </strong>
                <Coin className="ad-balance-coin" />
              </div>
            </div>
            {/* Blue circle button with up arrow leading to Recarga (Image 2) */}
            <button
              className="ad-recharge-blue-circle"
              aria-label={text('Abrir tela de recarga', 'Open top-up screen')}
              title={text('Recarregar moedas', 'Top up coins')}
              onClick={() => go('recharge')}
            >
              <ArrowUp size={24} strokeWidth={2.8} />
            </button>
          </div>

          {/* Section: Extrato (Matching Image 5) */}
          <section className="ad-ledger-section">
            <h2 className="ad-ledger-heading">{text('Extrato', 'History')}</h2>
            <div className="ad-ledger-list">
              {(data?.transactions ?? []).map((t) => (
                <article key={t.id} className="ad-ledger-card">
                  <div className="ad-ledger-details">
                    <h3 className="ad-ledger-label">{m(t.label)}</h3>
                    <span className="ad-ledger-date">
                      {formatTransactionDate(t.createdAt, uiLanguage)}
                    </span>
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
                  <p>{text('Nenhuma transação recente.', 'No recent transactions.')}</p>
                  <small>
                    {text(
                      'Faça o check-in diário ou conclua lições para receber suas primeiras moedas.',
                      'Check in daily or complete lessons to get your first coins.'
                    )}
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
              <strong>{text('Em breve:', 'Coming soon:')}</strong>{' '}
              {text(
                'Pacotes demonstrativos. Pagamentos e cobranças estão desativados no momento.',
                'Demo packages. Payments and charges are currently disabled.'
              )}
            </p>
          </div>

          <div className="ad-packages-list">
            {[
              {
                id: 'punhado',
                name: 'Punhado',
                nameEn: 'Handful',
                amount: 100,
                bonus: '+50 para apoiadores',
                price: 'R$ 2,90',
              },
              {
                id: 'bolsa',
                name: 'Bolsa',
                nameEn: 'Pouch',
                amount: 300,
                bonus: '+150 para apoiadores',
                price: 'R$ 5,90',
              },
              {
                id: 'bau',
                name: 'Baú',
                nameEn: 'Chest',
                amount: 900,
                bonus: '+450 para apoiadores',
                price: 'R$ 12,90',
              },
              {
                id: 'cofre',
                name: 'Cofre',
                nameEn: 'Vault',
                amount: 2000,
                bonus: '+1.000 para apoiadores',
                price: 'R$ 24,90',
              },
              {
                id: 'tesouro',
                name: 'Tesouro',
                nameEn: 'Treasure',
                amount: 4500,
                bonus: '+2.250 para apoiadores',
                price: 'R$ 49,90',
              },
              {
                id: 'montanha',
                name: 'Montanha',
                nameEn: 'Mountain',
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
                  <h3 className="ad-pkg-name">{text(pkg.name, pkg.nameEn)}</h3>
                  <div className="ad-pkg-amount-row">
                    <span className="ad-pkg-amount">{pkg.amount.toLocaleString(locale)}</span>
                    <Coin className="ad-pkg-coin" />
                  </div>
                  <small className="ad-pkg-bonus">
                    {text(pkg.bonus, pkg.bonus.replace('para apoiadores', 'for supporters'))}
                  </small>
                </div>
                <button
                  className="ad-pkg-buy-btn"
                  onClick={() =>
                    setNotice(
                      text(
                        `O pacote "${pkg.name}" estará disponível para aquisição em breve!`,
                        `The "${pkg.nameEn}" package will be available for purchase soon!`
                      )
                    )
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
          <section
            className="ad-portrait-editor"
            aria-label={text('Retrato de diálogo', 'Dialogue portrait')}
          >
            <Portrait
              avatar={draft}
              name={data?.username ?? text('Seu personagem', 'Your character')}
              assetBase={assetBase}
            />
            <div>
              <h2>{text('Seu retrato nas conversas', 'Your portrait in conversations')}</h2>
              <p>
                {text(
                  'Pele, olhos, cabelo, roupas e acessórios acompanham suas escolhas.',
                  'Skin, eyes, hair, outfits and accessories follow your choices.'
                )}
              </p>
              <div className="ad-character-turntable">
                <button
                  className="ad-rotate-btn"
                  aria-label={text('Girar à esquerda', 'Rotate left')}
                  onClick={() => setDirection((direction + 3) % 4)}
                >
                  <RotateCcw size={18} />
                </button>
                <div className="ad-avatar-preview-box">
                  <PixelAvatar
                    avatar={draft}
                    direction={['down', 'right', 'up', 'left'][direction]}
                  />
                </div>
                <button
                  className="ad-rotate-btn"
                  aria-label={text('Girar à direita', 'Rotate right')}
                  onClick={() => setDirection((direction + 1) % 4)}
                >
                  <RotateCw size={18} />
                </button>
              </div>
              <fieldset className="ad-gender-picker">
                <legend>{text('Gênero do personagem', 'Character gender')}</legend>
                {(
                  [
                    { value: 'masculine', label: text('Masculino', 'Masculine') },
                    { value: 'feminine', label: text('Feminino', 'Feminine') },
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
                {text(
                  'Define as feições do personagem e do retrato. Todas as peças podem ser usadas nas duas opções.',
                  'Sets the features of the character and portrait. Every piece works with both options.'
                )}
              </p>
            </div>
          </section>

          {/* Category Tabs (Matching Image 4) */}
          <div className="ad-category-tabs-row" role="tablist">
            {[
              { id: 'skin', label: text('Corpo', 'Body') },
              { id: 'eyes', label: text('Olhos', 'Eyes') },
              { id: 'outfit', label: text('Roupas', 'Outfits') },
              { id: 'hair', label: text('Cabelo', 'Hair') },
              { id: 'accessory', label: text('Acessórios', 'Accessories') },
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
            <section className="ad-hair-colors" aria-label={text('Cor do cabelo', 'Hair color')}>
              <h2>{text('Cor do cabelo', 'Hair color')}</h2>
              <ColorPalette
                aria-label={text('Cor do cabelo', 'Hair color')}
                colors={hairColors}
                names={hairColorNames.map(m)}
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
                    hair: HAIRSTYLES.length,
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
                    aria-label={
                      category === 'outfit'
                        ? m(OUTFIT_SPECS[i].name)
                        : category === 'hair'
                          ? text(HAIRSTYLES[i].name, HAIRSTYLES[i].nameEn)
                          : `${category === 'skin' ? text('Corpo', 'Body') : category === 'eyes' ? text('Olhos', 'Eyes') : text('Acessório', 'Accessory')} ${i + 1}`
                    }
                    aria-pressed={isSelected}
                    title={category === 'outfit' ? m(OUTFIT_SPECS[i].name) : undefined}
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
                    {(category === 'hair' || category === 'outfit') && (
                      <span className="ad-hairstyle-name">
                        {category === 'outfit'
                          ? m(OUTFIT_SPECS[i].name)
                          : text(HAIRSTYLES[i].name, HAIRSTYLES[i].nameEn)}
                      </span>
                    )}
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
        <Suspense
          fallback={
            <p className="ad-loading">
              {text('Carregando o mundinho em pixel art…', 'Loading the pixel-art world…')}
            </p>
          }
        >
          <World
            avatar={equippedAvatar}
            playerLevel={xp.level}
            initialPosition={worldPosition.current}
            onPositionChange={(position) => {
              worldPosition.current = position;
            }}
            assetBase={assetBase}
            username={data?.username ?? 'Pedrolado'}
            chestClaimed={data?.chest?.claimed ?? false}
            chestDay={data?.chest?.day ?? data?.checkin.day ?? ''}
            onBoss={() => go('boss')}
            onPortal={() => {
              setArenaSeed(null);
              go('arena');
            }}
            onBack={() => go('home')}
            onInventory={() => go('inventory')}
            onEncounter={(id) => {
              setCreature(id);
              void startBattle(language, id);
            }}
            onChest={async () => {
              const next = await act({ type: 'chest' });
              if (!next?.chest || next.chest.awarded === undefined)
                throw new Error(
                  text(
                    'Não foi possível confirmar o resgate. Tente novamente.',
                    'Could not confirm the claim. Try again.'
                  )
                );
              return { awarded: next.chest.awarded, reward: next.chest.reward };
            }}
          />
        </Suspense>
      )}

      {view === 'boss' && (
        <VeilBoss
          audio={battleAudio}
          onLeave={() => go('world')}
          assetBase={assetBase}
          username={data?.username}
          level={xp.level}
        />
      )}
      {view === 'arena' && (
        <MultiplayerArena
          transport={arenaTransport}
          language={language}
          initialState={arenaSeed}
          assetBase={assetBase}
          onLeave={() => {
            setArenaSeed(null);
            go('world');
          }}
        />
      )}

      {/* ============================================================ */}
      {/* 6. VIEW: BATTLE (Concept Educational Battles, Section 10)    */}
      {/* ============================================================ */}
      {view === 'battle' && (
        <div className="ad-battle-view">
          {(!battle || battle.status === 'fled') && (
            <div className="ad-battle-lobby">
              <div className="ad-lobby-header">
                <h2>{text('Prepare sua aventura', 'Prepare your adventure')}</h2>
                <p>
                  {text(
                    'Cada golpe pode sair direto ou pedir um exercício. Sem equipamentos, as chances são 75% de golpe direto e 25% de exercício. Vença criaturas para encontrar equipamentos e fortalecer seu aventureiro.',
                    'Each move can land directly or ask for an exercise. Without equipment, the odds are 75% direct hit and 25% exercise. Defeat creatures to find equipment and strengthen your adventurer.'
                  )}
                </p>
              </div>

              <div className="ad-lobby-controls">
                <label className="ad-lobby-label">
                  {text('Linguagem do Combate', 'Battle language')}
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
                <span>{text('Explorar o Mundinho', 'Explore the World')}</span>
              </button>
              <small className="ad-lobby-tip">
                {text(
                  'Encontre uma criatura na clareira. Você pode enfrentar criaturas de nível igual ou inferior ao seu.',
                  'Find a creature in the clearing. You can face creatures at or below your level.'
                )}
              </small>
              <div
                className="ad-encounter-levels"
                aria-label={text('Níveis das criaturas', 'Creature levels')}
              >
                {CREATURES.map((c) => (
                  <article
                    key={c.id}
                    className={canChallengeCreature(xp.level, c.level) ? '' : 'is-locked'}
                  >
                    <PixelCreature kind={c.id} />
                    <div>
                      <strong>{m(c.name)}</strong>
                      <span>
                        {text('Nível', 'Level')} {c.level} ·{' '}
                        {canChallengeCreature(xp.level, c.level)
                          ? text('Pode enfrentar', 'Can challenge')
                          : `${text('Requer nível', 'Requires level')} ${c.level}`}
                      </span>
                      <PixelMeter
                        label={`${text('Vida de', 'HP of')} ${m(c.name)}`}
                        value={100}
                        compact
                      />
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
                  backgroundImage: `url(${adventureAsset('blue-battle.png', assetBase)})`,
                }}
              >
                {/* Enemy Combatant */}
                <div className="ad-combatant ad-combatant-enemy">
                  <div className="ad-combatant-card">
                    <span className="ad-combatant-name">{m(opponent.name)}</span>
                    <small className="ad-combatant-meta">
                      {text('Inimigo · Nível', 'Enemy · Level')}{' '}
                      {battle.enemyLevel ?? opponent.level} · {LANGUAGE_NAMES[battle.language]}
                    </small>
                    <PixelMeter
                      value={battle.enemyHp}
                      max={battle.enemyMaxHp ?? 100}
                      label={`${text('Vida de', 'HP of')} ${m(opponent.name)}`}
                    />
                    <span className="ad-hp-number">
                      {battle.enemyHp} / {battle.enemyMaxHp ?? 100} {text('PV', 'HP')}
                    </span>
                  </div>
                  <div className="battle-sprite battle-sprite-enemy">
                    <PixelCreature
                      kind={opponent.id}
                      color={opponent.color}
                      className={combatPhase === 'enemy-attack' ? 'is-attacking' : ''}
                    />
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
                        {text('Errou', 'Miss')}
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
                      bow={attackEffect === 'focus'}
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
                    <small className="ad-combatant-meta">
                      {text('Seu nível ·', 'Your level ·')} {xp.level}
                    </small>
                    <PixelMeter
                      value={battle.hp}
                      max={battle.maxHp ?? combatStats.maxHp}
                      label={`${text('Vida de', 'HP of')} ${data?.username ?? text('jogador', 'player')}`}
                    />
                    <span className="ad-hp-number">
                      {battle.hp} / {battle.maxHp ?? combatStats.maxHp} {text('PV', 'HP')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Console & Battle Turn Actions */}
              <div className="ad-battle-bottom-console">
                <p className="ad-battle-narrative" role="status" aria-live="polite">
                  {combatPhase === 'flee'
                    ? text(
                        'Você fugiu. Voltando para a clareira…',
                        'You fled. Heading back to the clearing…'
                      )
                    : m(battle.feedback)}
                </p>

                {battle.status === 'active' ? (
                  battle.question?.code ? (
                    <CodeBattle
                      key={`${battle.id}:${battle.question.id}`}
                      question={battle.question}
                      battleLanguage={battle.language}
                      avatar={equippedAvatar}
                      busy={busy}
                      onSkip={
                        bugHunter
                          ? () =>
                              void act({
                                type: 'battle-skip',
                                battle: battle.id,
                                turn: battle.turn,
                                question: battle.question!.id,
                              })
                          : undefined
                      }
                      onEquipBugHunter={
                        !bugHunter && data?.inventory.includes(BUG_HUNTER_TITLE_ID)
                          ? () =>
                              void act(
                                { type: 'equip', item: BUG_HUNTER_TITLE_ID },
                                text(
                                  'Caça-bugs equipado. Use a habilidade para atacar.',
                                  'Bug Hunter equipped. Use the ability to attack.'
                                )
                              )
                          : undefined
                      }
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
                        {m(battle.question.concept)} · {m(battle.question.difficulty)}
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
                      <p className="ad-battle-odds">
                        {bugHunter && (
                          <strong>
                            {text(
                              'Caça-bugs equipado: exercícios de código dispensados.',
                              'Bug Hunter equipped: code exercises skipped.'
                            )}
                            <br />
                          </strong>
                        )}
                        {text('Golpe direto:', 'Direct hit:')}{' '}
                        {battle.directChance ?? combatStats.directChance}% ·{' '}
                        {text('Exercício:', 'Exercise:')}{' '}
                        {100 - (battle.directChance ?? combatStats.directChance)}%
                        <span>
                          {text('Proteção:', 'Protection:')} −
                          {battle.protection ?? combatStats.protection}{' '}
                          {text('por golpe', 'per hit')} · {text('Vida máxima:', 'Max HP:')}{' '}
                          {battle.maxHp ?? combatStats.maxHp} {text('PV', 'HP')}
                        </span>
                      </p>
                      <div
                        className="ad-skills-grid"
                        role="toolbar"
                        aria-label={text('Ações de batalha', 'Battle actions')}
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
                            <strong>{m(skill.name)}</strong>
                            <small>{m(skill.description)}</small>
                          </button>
                        ))}
                      </div>
                      <p className="rpg-command-hint">
                        {text(
                          'WASD / setas: selecionar · Enter / Espaço: confirmar',
                          'WASD / arrows: select · Enter / Space: confirm'
                        )}
                      </p>
                    </>
                  )
                ) : (
                  <div className="ad-battle-end-card">
                    <h2>
                      {battle.status === 'won'
                        ? text(
                            'Vitória! A criatura foi derrotada!',
                            'Victory! The creature was defeated!'
                          )
                        : text('Batalha encerrada.', 'Battle over.')}
                    </h2>
                    <p>
                      {battle.status === 'won'
                        ? battle.reward
                          ? text(
                              `+${battle.reward} moedas · +30 XP creditados no seu perfil!`,
                              `+${battle.reward} coins · +30 XP credited to your profile!`
                            )
                          : text('Você venceu a batalha!', 'You won the battle!')
                        : text(
                            'Revise o conceito e tente novamente! Suas lições continuam salvas.',
                            'Review the concept and try again! Your lessons are still saved.'
                          )}
                    </p>
                    {battleDrop && (
                      <div className="ad-battle-drop" role="status">
                        <EquipmentSprite itemId={battleDrop.id} />
                        <div>
                          <strong>
                            {battle.drop?.duplicateCoins
                              ? text('Equipamento repetido', 'Duplicate equipment')
                              : text('Novo equipamento!', 'New equipment!')}
                          </strong>
                          <p>
                            {m(battleDrop.name)} · {m(battleDrop.rarity)}
                          </p>
                          <p>
                            {battle.drop?.duplicateCoins
                              ? text(
                                  `Convertido em ${battle.drop.duplicateCoins} moedas.`,
                                  `Converted into ${battle.drop.duplicateCoins} coins.`
                                )
                              : `${equipmentBonusLabel(battleDrop, uiLanguage)} · ${text('Guardado no inventário.', 'Stored in your inventory.')}`}
                          </p>
                        </div>
                      </div>
                    )}
                    {battle.status === 'won' && (
                      <p role="status">
                        {text(
                          'Voltando ao Mundinho em instantes…',
                          'Heading back to the World shortly…'
                        )}
                      </p>
                    )}
                    <button className="ad-primary mt-4" onClick={() => go('world')}>
                      {text('Voltar ao Mundinho', 'Back to the World')}
                    </button>
                  </div>
                )}

                {battle.status === 'active' && (
                  <button
                    className="ad-flee-btn"
                    disabled={busy}
                    onClick={() => void act({ type: 'battle-flee', battle: battle.id })}
                  >
                    {text('Fugir', 'Flee')}
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
              {text('Saldo:', 'Balance:')}{' '}
              <strong>{data?.coins.toLocaleString(locale) ?? 0}</strong> <Coin />
            </span>
            <button
              className="ad-store-toggle-btn"
              onClick={() => go(view === 'store' ? 'inventory' : 'store')}
            >
              {view === 'store'
                ? text('Ver Meu Inventário', 'View My Inventory')
                : text('Visitar a Loja', 'Visit the Store')}
              <ChevronRight size={16} />
            </button>
          </div>
          {(view === 'store' || ITEMS.some((item) => data?.inventory.includes(item.id))) && (
            <nav
              className="ad-store-sections"
              aria-label={
                view === 'store'
                  ? text('Categorias da loja', 'Store categories')
                  : text('Seções do inventário', 'Inventory sections')
              }
            >
              {[
                [
                  view === 'store' ? 'ad-equipment-store-title' : 'ad-equipment-inventory-title',
                  text('Equipamentos', 'Equipment'),
                ],
                [
                  'ad-store-personalization-title',
                  text('Títulos e cosméticos', 'Titles and cosmetics'),
                ],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    const target = document.getElementById(id);
                    target?.scrollIntoView({ block: 'start' });
                    target?.focus({ preventScroll: true });
                  }}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}
          {view === 'inventory' && (
            <EquipmentInventory
              inventory={data?.inventory ?? []}
              equipped={data?.equipped ?? {}}
              stats={combatStats}
              busy={busy}
              locked={battle?.status === 'active'}
              onEquip={(item, remove) =>
                void act(
                  { type: 'equip', item, remove },
                  remove
                    ? text('Equipamento removido.', 'Equipment removed.')
                    : text(
                        'Equipamento pronto para a próxima batalha!',
                        'Equipment ready for the next battle!'
                      )
                )
              }
            />
          )}
          {view === 'store' && (
            <EquipmentStore
              inventory={data?.inventory ?? []}
              equipped={data?.equipped ?? {}}
              coins={data?.coins ?? 0}
              busy={!data || busy}
              locked={battle?.status === 'active'}
              confirming={confirm}
              onConfirmChange={setConfirm}
              onBuy={async (item) => {
                const result = await act(
                  { type: 'buy', item },
                  text(
                    'Equipamento comprado e guardado no inventário!',
                    'Equipment bought and stored in your inventory!'
                  )
                );
                if (result) setConfirm(null);
              }}
              onEquip={(item, remove) =>
                void act(
                  { type: 'equip', item, remove },
                  remove
                    ? text('Equipamento removido.', 'Equipment removed.')
                    : text(
                        'Equipamento pronto para a próxima batalha!',
                        'Equipment ready for the next battle!'
                      )
                )
              }
            />
          )}
          {(view === 'store' || ITEMS.some((item) => data?.inventory.includes(item.id))) && (
            <h2
              id="ad-store-personalization-title"
              tabIndex={-1}
              className="ad-store-section-heading"
            >
              {text('Títulos e cosméticos', 'Titles and cosmetics')}
            </h2>
          )}
          <div className="ad-store-grid">
            {ITEMS.filter((item) => view === 'store' || data?.inventory.includes(item.id))
              .sort((a, b) => Number(b.category === 'title') - Number(a.category === 'title'))
              .map((item) => {
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
                    <small className="ad-item-rarity">{m(item.rarity)}</small>
                    <h3 className="ad-item-name">{m(item.name)}</h3>
                    <p className="ad-item-desc">{m(item.description)}</p>

                    {owned ? (
                      <button
                        className={`ad-equip-btn ${worn ? 'is-worn' : ''}`}
                        disabled={busy}
                        aria-label={`${worn ? text('Desequipar', 'Unequip') : text('Equipar', 'Equip')} ${m(item.name)}`}
                        onClick={() =>
                          void act(
                            { type: 'equip', item: item.id, remove: worn },
                            worn
                              ? text('Item desequipado.', 'Item unequipped.')
                              : text('Item equipado com sucesso!', 'Item equipped!')
                          )
                        }
                      >
                        {worn ? text('Desequipar', 'Unequip') : text('Equipar', 'Equip')}
                      </button>
                    ) : confirm === item.id ? (
                      <div className="ad-confirm-box">
                        <p>
                          {text('Confirmar por', 'Confirm for')} {item.price}{' '}
                          {text('moedas?', 'coins?')}
                        </p>
                        <button
                          className="ad-primary w-full text-xs py-2"
                          disabled={busy}
                          aria-label={text(
                            `Confirmar compra de ${item.name} por ${item.price} moedas`,
                            `Confirm purchase of ${m(item.name)} for ${item.price} coins`
                          )}
                          onClick={async () => {
                            await act(
                              { type: 'buy', item: item.id },
                              text(
                                'Item comprado e adicionado ao inventário!',
                                'Item bought and added to your inventory!'
                              )
                            );
                            setConfirm(null);
                          }}
                        >
                          {text('Confirmar', 'Confirm')}
                        </button>
                        <button className="ad-cancel-text" onClick={() => setConfirm(null)}>
                          {text('Cancelar', 'Cancel')}
                        </button>
                      </div>
                    ) : (
                      <button
                        className="ad-buy-btn"
                        disabled={!data || busy || data.coins < item.price}
                        aria-label={text(
                          `Comprar ${item.name} por ${item.price} moedas`,
                          `Buy ${m(item.name)} for ${item.price} coins`
                        )}
                        onClick={() => setConfirm(item.id)}
                      >
                        <Coin />
                        <span>
                          {text('Comprar ·', 'Buy ·')} {item.price}
                        </span>
                        {data && data.coins < item.price && (
                          <small>{text('(Saldo insuficiente)', '(Not enough coins)')}</small>
                        )}
                      </button>
                    )}
                  </article>
                );
              })}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="ad-footer-badge">
        <Sparkles size={15} />
        <span>
          {text(
            'Stacklyst · Gamificação e Aprendizado de Programação',
            'Stacklyst · Gamification and Programming Learning'
          )}
        </span>
      </footer>
    </div>
  );
}
