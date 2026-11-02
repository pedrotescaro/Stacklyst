import { useEffect, useMemo, useRef, useState } from 'react';
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
  area = 'forest',
  peers = [],
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
  area?: 'forest' | 'arena';
  peers?: ArenaPlayer[];
}) {
  const dimensions = area === 'arena' ? ARENA : WORLD;
  const creatures = useMemo(() => (area === 'arena' ? [] : CREATURES), [area]);
  const objects = useMemo(
    () =>
      area === 'arena'
        ? [{ id: 'portal', name: 'Voltar para a clareira', ...ARENA.exit }]
        : WORLD_OBJECTS,
    [area]
  );
  const viewport = useRef<HTMLDivElement>(null);
  const keys = useRef(new Set<string>());
  const stick = useRef({ x: 0, y: 0 });
  const [clock, setClock] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setClock((t) => t + 1), 250);
    return () => clearInterval(timer);
  }, []);
  const player = useRef({ ...initialPosition, direction: 'down', walking: false });
  const [pose, setPose] = useState(player.current);
  useEffect(() => {
    onPositionChange?.({ x: pose.x, y: pose.y });
    onPoseChange?.(pose);
  }, [pose, onPositionChange, onPoseChange]);
  const [size, setSize] = useState({ width: 800, height: 480 });
  const [dialogue, setDialogue] = useState<string | null>(
    area === 'arena'
      ? null
      : 'Explore a clareira. Aproxime-se de criaturas para iniciar batalhas de conceitos ou interaja com placas e baús.'
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
  const worldPaused = Boolean(dialogue || showGuide || chestPhase !== 'idle');
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
      if (!target || Math.hypot(target.x - player.current.x, target.y - player.current.y) >= 55) {
        setDialogue('Aproxime-se de uma criatura, da placa, do baú ou da Ada para interagir.');
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
            `${creature.name} · nível ${creature.level}. Você está no nível ${playerLevel}. Continue suas lições para poder enfrentá-la.`
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
          'Placa: "Dica: Em Python ou JavaScript, compreenda a condição de parada antes de iniciar qualquer repetição."'
        );
      } else if (target.id === 'chest') {
        if (chestBusy.current) return;
        if (chestOpened) {
          setDialogue('Você já abriu o baú hoje. Volte amanhã para ganhar mais 10 moedas.');
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
              setDialogue('Você já abriu o baú hoje. Volte amanhã para ganhar mais 10 moedas.');
              return;
            }
            setChestPhase('opening');
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            chestTimer.current = setTimeout(
              () => {
                chestBusy.current = false;
                setChestPhase('idle');
                setDialogue(
                  `Baú aberto! ${reward} moedas creditadas no seu saldo. Volte amanhã para abrir de novo.`
                );
              },
              reduced ? 0 : 900
            );
          })
          .catch(() => {
            chestBusy.current = false;
            setChestPhase('idle');
            setDialogue(
              'Não foi possível abrir o baú. Suas moedas não foram confirmadas. Tente novamente.'
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
    creatures,
    objects,
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
        aria-label="Mundinho RPG. Mova-se com WASD ou setas e aperte E ou Espaço para interagir."
      >
        {/* TOP HUD (Matching Image 3) */}
        <div className="world-top-hud">
          <div className="world-hud-left">
            {onBack && (
              <button className="world-hud-btn" aria-label="Voltar para Trilhas" onClick={onBack}>
                <ArrowLeft size={18} />
              </button>
            )}
            <button
              className="world-hud-btn"
              aria-label="Diálogo"
              onClick={() =>
                setDialogue(
                  dialogue
                    ? null
                    : 'Explore o mundo, fale com Ada perto da cabana ou batalhe contra os erros digitais!'
                )
              }
            >
              <MessageSquare size={18} />
            </button>
            <button
              className={`world-hud-btn ${showMap ? 'is-active' : ''}`}
              aria-label="Visualizar mapa completo"
              onClick={() => setShowMap(!showMap)}
            >
              <MapIcon size={18} />
            </button>
            <div className="world-hud-btn is-status" title="Zona segura da clareira">
              <Shield size={18} />
            </div>
          </div>

          <div className="world-time-badge">
            <Moon size={14} className="text-amber-300" />
            <span>Dia 1 · 21:28</span>
          </div>

          <div className="world-hud-right">
            <button
              className="world-hud-btn"
              aria-label="Guia de programação"
              onClick={() => setShowGuide(!showGuide)}
            >
              <BookOpen size={18} />
            </button>
            {onInventory && (
              <button className="world-hud-btn" aria-label="Abrir inventário" onClick={onInventory}>
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
            backgroundImage: `url(${adventureAsset(area === 'arena' ? 'arena.png' : 'forest-ground.png', assetBase)})`,
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
                backgroundImage: `url(${adventureAsset('forest-scenery.png', assetBase)})`,
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
                      `${c.name} requer nível ${c.level}. Seu nível atual é ${playerLevel}.`
                    );
                    return;
                  }
                  keys.current.clear();
                  stick.current = { x: 0, y: 0 };
                  onEncounter(c.id);
                } else setDialogue('Aproxime-se da moita para encontrar esta criatura.');
              }}
            >
              <span
                className={`world-creature-level ${canChallengeCreature(playerLevel, c.level) ? '' : 'is-locked'}`}
                aria-label={`${c.name}, nível ${c.level}. ${canChallengeCreature(playerLevel, c.level) ? 'Pode enfrentar' : 'Nível insuficiente'}`}
              >
                <span className="world-creature-label">
                  <span>Nv. {c.level}</span>
                  {!canChallengeCreature(playerLevel, c.level) && <span>Bloqueado</span>}
                </span>
                <PixelMeter value={100} label={`Vida de ${c.name}`} compact />
              </span>
              <PixelCreature color={c.color} kind={c.id} />
            </div>
          ))}

          {objects.map((o) => (
            <button
              type="button"
              aria-label={
                o.id === 'guide'
                  ? 'Conversar com Ada'
                  : o.id === 'chest'
                    ? `Baú da clareira, ${chestPhase === 'pending' ? 'confirmando resgate' : chestPhase === 'opening' ? 'abrindo' : chestOpened ? 'recompensa de hoje resgatada' : 'abrir e ganhar 10 moedas'}`
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
                    ? 'Resgatado · volte amanhã'
                    : 'Baú diário · 10 moedas'
                  : o.name}
              </span>
              {o.id === 'guide' ? (
                <PixelAvatar avatar={ADA_AVATAR} />
              ) : o.id === 'portal' && area === 'arena' ? (
                <span className="world-arena-exit-hitbox" aria-hidden="true" />
              ) : (
                <WorldPropSprite
                  kind={o.id === 'portal' ? 'portal-hole' : o.id === 'chest' ? 'chest' : 'signpost'}
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
                  +10 moedas
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
            <h3>Guia do Explorador</h3>
            <p>
              • <strong>Batalhas:</strong> Aproxime-se de qualquer criatura e toque na espada para
              duelar com perguntas de código.
            </p>
            <p>
              • <strong>Recuperação:</strong> Habilidades como Funções restauram vida se você
              responder o conceito corretamente.
            </p>
            <p>
              • <strong>Trilhas:</strong> Seu progresso de aulas tradicionais é somado aos pontos de
              RPG.
            </p>
            <button className="ad-primary" onClick={() => setShowGuide(false)}>
              Entendido
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
            aria-label={isCreature ? 'Batalhar com criatura' : 'Interagir'}
            onClick={() => interaction.current()}
          >
            <Swords size={28} />
            {nearest && (
              <span className="world-action-label">{isCreature ? 'Batalha' : 'Interagir'}</span>
            )}
          </button>
        </div>
      </div>

      <div className="world-hint-footer">
        <p>
          WASD ou setas para mover · Espaço / E para ação ·{' '}
          {area === 'arena'
            ? 'Convide um amigo mútuo para batalhar.'
            : 'Criaturas iniciam batalhas educativas.'}
        </p>
      </div>
    </div>
  );
}
