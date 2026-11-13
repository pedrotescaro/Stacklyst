import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalizedText } from '../../i18n/useLocalizedText';
import { translateMundinho } from '../../lib/mundinho/i18n';
import {
  ArrowLeft,
  Backpack,
  BookOpen,
  Map as MapIcon,
  MessageSquare,
  Moon,
  Shield,
  Swords,
} from 'lucide-react';
import { ADA_AVATAR, CREATURES, type Avatar } from '../../lib/mundinho/types';
import {
  movementDirection,
  movePlayer,
  walkablePosition,
  SCENERY,
  worldDepth,
  WORLD,
  WORLD_OBJECTS,
} from '../../lib/mundinho/world';
import { PixelAvatar, PixelCreature } from './PixelArt';
import { HabitatSprite, WorldPropSprite } from './ScenerySprites';
import { PixelMeter } from './PixelMeter';
import { WorldDialogue } from './WorldDialogue';
import { adventureAsset } from './assets';
import { TouchStick } from './TouchStick';
import { canChallengeCreature } from '../../lib/mundinho/rules';
import { ARENA, arenaMove } from '../../lib/mundinho/arena-rules';
import type { ArenaPlayer, ArenaPosition } from '../../lib/mundinho/arena-types';

export default function World({
  avatar,
  assetBase,
  username,
  onEncounter,
  onChest,
  chestClaimed = false,
  chestDay = '',
  onBack,
  onInventory,
  playerLevel = 1,
  initialPosition = WORLD.spawn,
  onPositionChange,
  onPoseChange,
  onPortal,
  onBoss,
  area = 'forest',
  peers = [],
  onArenaPlayers,
  overlayOpen = false,
}: {
  avatar: Avatar;
  assetBase: string;
  username: string;
  onEncounter: (id: string) => void;
  onChest: () => Promise<{ awarded: boolean; reward: number }>;
  chestClaimed?: boolean;
  chestDay?: string;
  onBack?: () => void;
  onInventory?: () => void;
  playerLevel?: number;
  initialPosition?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onPoseChange?: (position: ArenaPosition) => void;
  onPortal?: () => void;
  onBoss?: () => void;
  area?: 'forest' | 'arena';
  peers?: ArenaPlayer[];
  onArenaPlayers?: () => void;
  overlayOpen?: boolean;
}) {
  const { text, language: uiLanguage } = useLocalizedText();
  const m = useCallback((value: string) => translateMundinho(value, uiLanguage), [uiLanguage]);
  const dimensions = area === 'arena' ? ARENA : WORLD;
  const creatures = useMemo(() => (area === 'arena' ? [] : CREATURES), [area]);
  const objects = useMemo(
    () =>
      area === 'arena'
        ? [
            {
              id: 'portal',
              name: text('Voltar para a clareira', 'Back to the clearing'),
              ...ARENA.exit,
            },
          ]
        : WORLD_OBJECTS.map((object) => ({
            ...object,
            name: translateMundinho(object.name, uiLanguage),
          })),
    [area, text, uiLanguage]
  );
  const viewport = useRef<HTMLDivElement>(null);
  const keys = useRef(new Set<string>());
  const stick = useRef({ x: 0, y: 0 });
  const [clock, setClock] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setClock((t) => t + 1), 250);
    return () => clearInterval(timer);
  }, []);
  const [startingPosition] = useState(() =>
    area === 'arena' ? initialPosition : walkablePosition(initialPosition)
  );
  const player = useRef({ ...startingPosition, direction: 'down', walking: false });
  const [pose, setPose] = useState(player.current);
  useEffect(() => {
    onPositionChange?.({ x: pose.x, y: pose.y });
    onPoseChange?.(pose);
  }, [pose, onPositionChange, onPoseChange]);
  const [size, setSize] = useState({ width: 800, height: 480 });
  const [dialogue, setDialogue] = useState<string | null>(
    area === 'arena'
      ? null
      : text(
          'Explore a clareira. Aproxime-se de criaturas para iniciar batalhas de conceitos ou interaja com placas e baús.',
          'Explore the clearing. Approach creatures to start concept battles or interact with signs and chests.'
        )
  );
  const [showMap, setShowMap] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [chestPhase, setChestPhase] = useState<'idle' | 'pending' | 'opening'>('idle');
  const [openedDay, setOpenedDay] = useState<string | null>(null);
  const chestBusy = useRef(false);
  const chestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (chestTimer.current) clearTimeout(chestTimer.current);
    },
    []
  );
  const chestOpened = chestClaimed || openedDay === chestDay;
  const worldPaused = Boolean(overlayOpen || dialogue || showGuide || chestPhase !== 'idle');
  const paused = useRef(false);
  paused.current = worldPaused;
  const closeDialogue = () => {
    setDialogue(null);
    keys.current.clear();
    stick.current = { x: 0, y: 0 };
    viewport.current?.focus({ preventScroll: true });
  };

  const visibleCreatures = creatures.filter(
    (creature, i) => creature.level >= 4 || (clock + i * 7) % 64 < 52
  );
  const targets = [...visibleCreatures, ...objects];
  const nearest = targets.find((e) => Math.hypot(e.x - pose.x, e.y - pose.y) < 55);
  const isCreature = nearest && creatures.some((c) => c.id === nearest.id);
  useEffect(() => {
    const portal = objects.find((o) => o.id === 'portal');
    if (!worldPaused && portal && Math.hypot(pose.x - portal.x, pose.y - portal.y) < 18)
      onPortal?.();
  }, [pose.x, pose.y, worldPaused, onPortal, objects]);

  const interaction = useRef<(objectId?: string) => void>(() => {});
  useEffect(() => {
    interaction.current = (objectId) => {
      const target = objectId ? objects.find((object) => object.id === objectId) : nearest;
      if (area === 'arena' && !objectId && !target) {
        keys.current.clear();
        stick.current = { x: 0, y: 0 };
        onArenaPlayers?.();
        return;
      }
      if (!target || Math.hypot(target.x - player.current.x, target.y - player.current.y) >= 55) {
        setDialogue(
          text(
            'Aproxime-se de uma criatura, da placa, do baú ou da Ada para interagir.',
            'Approach a creature, the sign, the chest or Ada to interact.'
          )
        );
        return;
      }
      if (target.id === 'boss') {
        keys.current.clear();
        stick.current = { x: 0, y: 0 };
        onBoss?.();
        return;
      }
      if (target.id === 'portal') {
        keys.current.clear();
        stick.current = { x: 0, y: 0 };
        onPortal?.();
      } else if (creatures.some((c) => c.id === target.id)) {
        const creature = creatures.find((c) => c.id === target.id)!;
        if (!canChallengeCreature(playerLevel, creature.level)) {
          setDialogue(
            text(
              `${creature.name} · nível ${creature.level}. Você está no nível ${playerLevel}. Continue suas lições para poder enfrentá-la.`,
              `${m(creature.name)} · level ${creature.level}. You are level ${playerLevel}. Keep up your lessons to face it.`
            )
          );
          return;
        }
        keys.current.clear();
        stick.current = { x: 0, y: 0 };
        onEncounter(target.id);
      } else if (target.id === 'guide') {
        keys.current.clear();
        stick.current = { x: 0, y: 0 };
        setDialogue('ada');
      } else if (target.id === 'sign') {
        setDialogue(
          text(
            'Placa: "Dica: Em Python ou JavaScript, compreenda a condição de parada antes de iniciar qualquer repetição."',
            'Sign: "Tip: In Python or JavaScript, understand the stopping condition before starting any loop."'
          )
        );
      } else if (target.id === 'chest') {
        if (chestBusy.current) return;
        if (chestOpened) {
          setDialogue(
            text(
              'Você já abriu o baú hoje. Volte amanhã para ganhar mais 10 moedas.',
              'You already opened the chest today. Come back tomorrow for 10 more coins.'
            )
          );
          return;
        }
        chestBusy.current = true;
        setChestPhase('pending');
        keys.current.clear();
        stick.current = { x: 0, y: 0 };
        void onChest()
          .then(({ awarded, reward }) => {
            setOpenedDay(chestDay);
            if (!awarded) {
              chestBusy.current = false;
              setChestPhase('idle');
              setDialogue(
                text(
                  'Você já abriu o baú hoje. Volte amanhã para ganhar mais 10 moedas.',
                  'You already opened the chest today. Come back tomorrow for 10 more coins.'
                )
              );
              return;
            }
            setChestPhase('opening');
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            chestTimer.current = setTimeout(
              () => {
                chestBusy.current = false;
                setChestPhase('idle');
                setDialogue(
                  text(
                    `Baú aberto! ${reward} moedas creditadas no seu saldo. Volte amanhã para abrir de novo.`,
                    `Chest opened! ${reward} coins credited to your balance. Come back tomorrow to open it again.`
                  )
                );
              },
              reduced ? 0 : 900
            );
          })
          .catch(() => {
            chestBusy.current = false;
            setChestPhase('idle');
            setDialogue(
              text(
                'Não foi possível abrir o baú. Suas moedas não foram confirmadas. Tente novamente.',
                'Could not open the chest. Your coins were not confirmed. Try again.'
              )
            );
          });
      }
    };
  }, [
    nearest,
    onEncounter,
    onChest,
    playerLevel,
    chestOpened,
    chestDay,
    onPortal,
    onBoss,
    onArenaPlayers,
    area,
    creatures,
    objects,
    text,
    m,
  ]);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;

    const observer = new ResizeObserver(() =>
      setSize({ width: el.clientWidth, height: el.clientHeight })
    );
    observer.observe(el);

    const controls = new Set([
      'w',
      'a',
      's',
      'd',
      'arrowup',
      'arrowdown',
      'arrowleft',
      'arrowright',
    ]);
    const down = (e: KeyboardEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (target?.closest('input, textarea, select, a, [contenteditable="true"]')) return;
      if (target && target !== document.body && !el.closest('.adventure')?.contains(target)) return;
      const key = e.key.toLowerCase();
      if (paused.current) {
        if (controls.has(key)) e.preventDefault();
        return;
      }
      if (controls.has(key)) {
        e.preventDefault();
        keys.current.add(key);
      }
      if ((key === 'e' || (key === ' ' && !target?.closest('button'))) && !e.repeat) {
        e.preventDefault();
        interaction.current();
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const clear = () => {
      keys.current.clear();
      stick.current = { x: 0, y: 0 };
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', clear);

    let frame = 0;
    let previous = performance.now();

    const tick = (time: number) => {
      const dt = Math.min((time - previous) / 1000, 0.04);
      previous = time;
      if (paused.current) {
        keys.current.clear();
        stick.current = { x: 0, y: 0 };
      }
      const held = keys.current;

      let dx =
        Number(held.has('d') || held.has('arrowright')) -
        Number(held.has('a') || held.has('arrowleft')) +
        stick.current.x;
      let dy =
        Number(held.has('s') || held.has('arrowdown')) -
        Number(held.has('w') || held.has('arrowup')) +
        stick.current.y;

      const direction = movementDirection(dx, dy, player.current.direction);

      const magnitude = Math.hypot(dx, dy);
      if (magnitude > 1) {
        dx /= magnitude;
        dy /= magnitude;
      }

      player.current = {
        ...(area === 'arena'
          ? arenaMove(player.current, dx * 140 * dt, dy * 140 * dt)
          : movePlayer(player.current.x, player.current.y, dx * 140 * dt, dy * 140 * dt)),
        direction,
        walking: Boolean(dx || dy),
      };

      // Camera and character must commit the same simulation frame. A separate
      // camera transition or 30 Hz render throttle makes touch movement wobble.
      const next = player.current;
      setPose((current) =>
        current.x === next.x &&
        current.y === next.y &&
        current.direction === next.direction &&
        current.walking === next.walking
          ? current
          : { ...next }
      );

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    if (!paused.current) el.focus();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
      document.removeEventListener('visibilitychange', clear);
      clear();
    };
  }, [area]);

  // Camera scale and offset to follow player smoothly
  const scale = showMap
    ? Math.min(size.width / dimensions.width, size.height / dimensions.height)
    : area === 'arena'
      ? Math.max(
          0.85,
          Math.min(1.3, Math.max(size.width / dimensions.width, size.height / dimensions.height))
        )
      : Math.max(0.85, Math.min(1.2, size.width / 850));
  const x = showMap
    ? (size.width - dimensions.width * scale) / 2
    : dimensions.width * scale < size.width
      ? (size.width - dimensions.width * scale) / 2
      : Math.min(
          0,
          Math.max(size.width - dimensions.width * scale, size.width / 2 - pose.x * scale)
        );
  const y = showMap
    ? (size.height - dimensions.height * scale) / 2
    : dimensions.height * scale < size.height
      ? (size.height - dimensions.height * scale) / 2
      : Math.min(
          0,
          Math.max(size.height - dimensions.height * scale, size.height / 2 - pose.y * scale)
        );

  return (
    <div className="world-shell" data-area={area}>
      <div
        ref={viewport}
        className="world-viewport"
        tabIndex={0}
        aria-label={text(
          'Mundinho RPG. Mova-se com WASD ou setas e aperte E ou Espaço para interagir.',
          'World RPG. Move with WASD or arrows and press E or Space to interact.'
        )}
      >
        {/* TOP HUD (Matching Image 3) */}
        <div className="world-top-hud">
          <div className="world-hud-left">
            {onBack && (
              <button
                className="world-hud-btn"
                aria-label={text('Voltar para Trilhas', 'Back to Trails')}
                onClick={onBack}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <button
              className="world-hud-btn"
              aria-label={text('Diálogo', 'Dialogue')}
              onClick={() =>
                setDialogue(
                  dialogue
                    ? null
                    : text(
                        'Explore o mundo, fale com Ada perto da cabana ou batalhe contra os erros digitais!',
                        'Explore the world, talk to Ada near the cabin or battle the digital bugs!'
                      )
                )
              }
            >
              <MessageSquare size={18} />
            </button>
            <button
              className={`world-hud-btn ${showMap ? 'is-active' : ''}`}
              aria-label={text('Visualizar mapa completo', 'View full map')}
              onClick={() => setShowMap(!showMap)}
            >
              <MapIcon size={18} />
            </button>
            <div
              className="world-hud-btn is-status"
              title={text('Zona segura da clareira', 'Clearing safe zone')}
            >
              <Shield size={18} />
            </div>
          </div>

          <div className="world-time-badge">
            <Moon size={14} className="text-amber-300" />
            <span>{text('Dia 1 · 21:28', 'Day 1 · 21:28')}</span>
          </div>

          <div className="world-hud-right">
            <button
              className="world-hud-btn"
              aria-label={text('Guia de programação', 'Programming guide')}
              onClick={() => setShowGuide(!showGuide)}
            >
              <BookOpen size={18} />
            </button>
            {onInventory && (
              <button
                className="world-hud-btn"
                aria-label={text('Abrir inventário', 'Open inventory')}
                onClick={onInventory}
              >
                <Backpack size={18} />
              </button>
            )}
          </div>
        </div>

        {/* 2D TILEMAP & ENTITIES (Using LibreSprite exported scenery) */}
        <div
          className="world-map"
          inert={worldPaused}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            transform: `translate(${x}px, ${y}px) scale(${scale})`,
            backgroundImage: `url(${adventureAsset(area === 'arena' ? 'blue-arena.png' : 'blue-meadow.png', assetBase)})`,
          }}
        >
          {(area === 'arena' ? [] : SCENERY.objects).map((object) => (
            <div
              key={object.id}
              className="world-scenery"
              data-scenery={object.id}
              aria-hidden="true"
              style={{
                left: object.x,
                top: object.y,
                width: SCENERY.width,
                height: SCENERY.height,
                zIndex: worldDepth(object.depth),
                backgroundImage: `url(${adventureAsset('blue-grove.png', assetBase)})`,
                backgroundSize: `${SCENERY.width * SCENERY.columns}px ${SCENERY.height * SCENERY.rows}px`,
                backgroundPosition: `${-(object.frame % SCENERY.columns) * SCENERY.width}px ${-Math.floor(object.frame / SCENERY.columns) * SCENERY.height}px`,
              }}
            />
          ))}
          {creatures.map((c, i) => (
            <HabitatSprite key={c.id} x={c.x} y={c.y} variant={i} assetBase={assetBase} />
          ))}
          {creatures.map((c, i) => (
            <div
              key={c.id}
              className={`world-entity world-habitat ${c.level >= 4 || (clock + i * 7) % 64 < 52 ? 'is-visible' : 'is-hidden'}`}
              style={{ left: c.x, top: c.y, zIndex: worldDepth(c.y) }}
              onClick={() => {
                if (Math.hypot(c.x - pose.x, c.y - pose.y) < 55 && visibleCreatures.includes(c)) {
                  if (!canChallengeCreature(playerLevel, c.level)) {
                    setDialogue(
                      text(
                        `${c.name} requer nível ${c.level}. Seu nível atual é ${playerLevel}.`,
                        `${m(c.name)} requires level ${c.level}. Your current level is ${playerLevel}.`
                      )
                    );
                    return;
                  }
                  keys.current.clear();
                  stick.current = { x: 0, y: 0 };
                  onEncounter(c.id);
                } else
                  setDialogue(
                    text(
                      'Aproxime-se da moita para encontrar esta criatura.',
                      'Get closer to the bush to find this creature.'
                    )
                  );
              }}
            >
              <span
                className={`world-creature-level ${canChallengeCreature(playerLevel, c.level) ? '' : 'is-locked'}`}
                aria-label={`${m(c.name)}, ${text('nível', 'level')} ${c.level}. ${canChallengeCreature(playerLevel, c.level) ? text('Pode enfrentar', 'Can challenge') : text('Nível insuficiente', 'Level too low')}`}
              >
                <span className="world-creature-label">
                  <span>
                    {text('Nv.', 'Lv.')} {c.level}
                  </span>
                  {!canChallengeCreature(playerLevel, c.level) && (
                    <span>{text('Bloqueado', 'Locked')}</span>
                  )}
                </span>
                <PixelMeter
                  value={100}
                  label={`${text('Vida de', 'HP of')} ${m(c.name)}`}
                  compact
                />
              </span>
              <PixelCreature color={c.color} kind={c.id} />
            </div>
          ))}

          {objects.map((o) => (
            <button
              type="button"
              aria-label={
                o.id === 'guide'
                  ? text('Conversar com Ada', 'Talk to Ada')
                  : o.id === 'chest'
                    ? `${text('Baú da clareira', 'Clearing chest')}, ${chestPhase === 'pending' ? text('confirmando resgate', 'confirming claim') : chestPhase === 'opening' ? text('abrindo', 'opening') : chestOpened ? text('recompensa de hoje resgatada', 'today’s reward claimed') : text('abrir e ganhar 10 moedas', 'open and earn 10 coins')}`
                    : o.name
              }
              aria-busy={o.id === 'chest' && chestPhase !== 'idle' ? true : undefined}
              key={o.id}
              className="world-entity world-object"
              style={{ left: o.x, top: o.y, zIndex: worldDepth(o.y) }}
              onClick={() => interaction.current(o.id)}
            >
              <span className="world-entity-badge">
                {o.id === 'chest'
                  ? chestOpened
                    ? text('Resgatado · volte amanhã', 'Claimed · come back tomorrow')
                    : text('Baú diário · 10 moedas', 'Daily chest · 10 coins')
                  : o.name}
              </span>
              {o.id === 'guide' ? (
                <PixelAvatar avatar={ADA_AVATAR} />
              ) : o.id === 'portal' && area === 'arena' ? (
                <span className="world-arena-exit-hitbox" aria-hidden="true" />
              ) : (
                <WorldPropSprite
                  kind={
                    o.id === 'boss'
                      ? 'boss-rift'
                      : o.id === 'portal'
                        ? 'portal-hole'
                        : o.id === 'chest'
                          ? 'chest'
                          : 'signpost'
                  }
                  assetBase={assetBase}
                  chestState={
                    chestPhase === 'opening'
                      ? 'opening'
                      : chestOpened && chestPhase !== 'pending'
                        ? 'open'
                        : 'closed'
                  }
                />
              )}
              {o.id === 'chest' && chestPhase === 'opening' && (
                <span className="world-chest-reward" role="status">
                  {text('+10 moedas', '+10 coins')}
                </span>
              )}
            </button>
          ))}

          {peers
            .filter((peer) => peer.online)
            .map((peer) => (
              <div
                key={peer.id}
                className="world-entity world-peer"
                style={{
                  left: peer.position.x,
                  top: peer.position.y,
                  zIndex: worldDepth(peer.position.y),
                }}
              >
                <span
                  className="world-player-name"
                  style={
                    Math.hypot(peer.position.x - pose.x, peer.position.y - pose.y) < 90
                      ? { transform: 'translateY(-18px)' }
                      : undefined
                  }
                >
                  {peer.name}
                </span>
                <PixelAvatar
                  avatar={peer.avatar}
                  direction={peer.position.direction}
                  walking={peer.position.walking}
                />
              </div>
            ))}

          {/* Player with Floating Username Tag (Matching Image 3) */}
          <div
            className="world-entity world-player"
            style={{ left: pose.x, top: pose.y, zIndex: worldDepth(pose.y) }}
          >
            <span className="world-player-name">{username}</span>
            <PixelAvatar avatar={avatar} direction={pose.direction} walking={pose.walking} />
          </div>
        </div>

        {dialogue && (
          <WorldDialogue
            key={dialogue}
            text={dialogue}
            conversation={dialogue === 'ada'}
            avatar={avatar}
            username={username}
            assetBase={assetBase}
            onClose={closeDialogue}
          />
        )}

        {/* GUIDE MODAL */}
        {showGuide && (
          <div className="world-guide-modal">
            <h3>{text('Guia do Explorador', 'Explorer’s Guide')}</h3>
            <p>
              • <strong>{text('Batalhas:', 'Battles:')}</strong>{' '}
              {text(
                'Aproxime-se de qualquer criatura e toque na espada para duelar com perguntas de código.',
                'Approach any creature and tap the sword to duel with code questions.'
              )}
            </p>
            <p>
              • <strong>{text('Recuperação:', 'Recovery:')}</strong>{' '}
              {text(
                'Habilidades como Funções restauram vida se você responder o conceito corretamente.',
                'Abilities like Functions restore HP if you answer the concept correctly.'
              )}
            </p>
            <p>
              • <strong>{text('Trilhas:', 'Trails:')}</strong>{' '}
              {text(
                'Seu progresso de aulas tradicionais é somado aos pontos de RPG.',
                'Your progress in regular lessons adds to your RPG points.'
              )}
            </p>
            <button className="ad-primary" onClick={() => setShowGuide(false)}>
              {text('Entendido', 'Got it')}
            </button>
          </div>
        )}

        {/* CONTROLS (D-Pad + Sword Button, Matching Image 3) */}
        <div className="world-controls" hidden={worldPaused}>
          <TouchStick
            onMove={(x, y) => {
              stick.current = { x, y };
            }}
          />
          {/* Big Action / Sword Button on Bottom Right */}
          <button
            className={`world-action-sword ${nearest ? 'is-target' : ''}`}
            aria-label={
              area === 'arena' && !nearest
                ? text('Amigos e batalha', 'Friends and battle')
                : isCreature
                  ? text('Batalhar com criatura', 'Battle the creature')
                  : text('Interagir', 'Interact')
            }
            onClick={() => interaction.current()}
          >
            <Swords size={28} />
            {nearest && (
              <span className="world-action-label">
                {isCreature ? text('Batalha', 'Battle') : text('Interagir', 'Interact')}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="world-hint-footer">
        <p>
          {text(
            'WASD ou setas para mover · Espaço / E para ação ·',
            'WASD or arrows to move · Space / E to act ·'
          )}{' '}
          {area === 'arena'
            ? text('Convide um amigo mútuo para batalhar.', 'Invite a mutual friend to battle.')
            : text(
                'Criaturas iniciam batalhas educativas.',
                'Creatures start educational battles.'
              )}
        </p>
      </div>
    </div>
  );
}
