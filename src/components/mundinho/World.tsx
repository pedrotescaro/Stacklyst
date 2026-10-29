import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Backpack,
  BookOpen,
  Map as MapIcon,
  MessageSquare,
  Moon,
  Shield,
  Swords,
  X,
} from 'lucide-react';
import { CREATURES, type Avatar } from '../../lib/mundinho/types';
import { movePlayer, WORLD, WORLD_OBJECTS } from '../../lib/mundinho/world';
import { PixelAvatar, PixelCreature, TreasureChest } from './PixelArt';
import { adventureAsset } from './assets';
import { TouchStick } from './TouchStick';

export default function World({
  avatar,
  assetBase,
  username,
  onEncounter,
  onChest,
  onBack,
  onInventory,
}: {
  avatar: Avatar;
  assetBase: string;
  username: string;
  onEncounter: (id: string) => void;
  onChest: () => Promise<void>;
  onBack?: () => void;
  onInventory?: () => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const keys = useRef(new Set<string>());
  const stick = useRef({ x: 0, y: 0 });
  const [clock, setClock] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setClock((t) => t + 1), 250);
    return () => clearInterval(timer);
  }, []);
  const player = useRef({ ...WORLD.spawn, direction: 'down', walking: false });
  const [pose, setPose] = useState(player.current);
  const [size, setSize] = useState({ width: 800, height: 480 });
  const [dialogue, setDialogue] = useState<string | null>(
    'Explore a clareira. Aproxime-se de criaturas para iniciar batalhas de conceitos ou interaja com placas e baús.'
  );
  const [showMap, setShowMap] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const visibleCreatures = CREATURES.filter((_, i) => (clock + i * 7) % 64 < 52);
  const targets = [...visibleCreatures, ...WORLD_OBJECTS];
  const nearest = targets.find((e) => Math.hypot(e.x - pose.x, e.y - pose.y) < 55);
  const isCreature = nearest && CREATURES.some((c) => c.id === nearest.id);

  const interaction = useRef<() => void>(() => {});
  useEffect(() => {
    interaction.current = () => {
      if (!nearest) {
        setDialogue('Aproxime-se de uma criatura, da placa, do baú ou da Ada para interagir.');
        return;
      }
      if (CREATURES.some((c) => c.id === nearest.id)) {
        keys.current.clear();
        onEncounter(nearest.id);
      } else if (nearest.id === 'guide') {
        setDialogue(
          'Ada: "Cada erro de programação é apenas uma hipótese descartada. Nas batalhas, use habilidades de conceitos para desarmar os bugs!"'
        );
      } else if (nearest.id === 'sign') {
        setDialogue(
          'Placa: "Dica: Em Python ou JavaScript, compreenda a condição de parada antes de iniciar qualquer repetição."'
        );
      } else if (nearest.id === 'chest') {
        void onChest()
          .then(() =>
            setDialogue(
              'Você abriu o Baú da Clareira! Recompensa de 10 moedas creditada no seu extrato.'
            )
          )
          .catch(() => setDialogue('Este baú já foi resgatado ou não pôde ser aberto no momento.'));
      }
    };
  }, [nearest, onEncounter, onChest]);

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
      const key = e.key.toLowerCase();
      if (controls.has(key)) {
        e.preventDefault();
        keys.current.add(key);
      }
      if ((key === 'e' || key === ' ') && !e.repeat) {
        e.preventDefault();
        interaction.current();
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const clear = () => {
      keys.current.clear();
      stick.current = { x: 0, y: 0 };
    };

    el.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', clear);

    let frame = 0;
    let previous = performance.now();
    let rendered = 0;

    const tick = (time: number) => {
      const dt = Math.min((time - previous) / 1000, 0.04);
      previous = time;
      const held = keys.current;

      let dx =
        Number(held.has('d') || held.has('arrowright')) -
        Number(held.has('a') || held.has('arrowleft')) +
        stick.current.x;
      let dy =
        Number(held.has('s') || held.has('arrowdown')) -
        Number(held.has('w') || held.has('arrowup')) +
        stick.current.y;

      const direction = dx
        ? dx > 0
          ? 'right'
          : 'left'
        : dy
          ? dy > 0
            ? 'down'
            : 'up'
          : player.current.direction;

      const magnitude = Math.hypot(dx, dy);
      if (magnitude > 1) {
        dx /= magnitude;
        dy /= magnitude;
      }

      player.current = {
        ...movePlayer(player.current.x, player.current.y, dx * 140 * dt, dy * 140 * dt),
        direction,
        walking: Boolean(dx || dy),
      };

      if (time - rendered > 30) {
        setPose({ ...player.current });
        rendered = time;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    el.focus();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
      document.removeEventListener('visibilitychange', clear);
      clear();
    };
  }, []);

  // Camera scale and offset to follow player smoothly
  const scale = showMap
    ? Math.min(size.width / WORLD.width, size.height / WORLD.height)
    : Math.max(0.85, Math.min(1.2, size.width / 850));
  const x = showMap
    ? (size.width - WORLD.width * scale) / 2
    : Math.min(0, Math.max(size.width - WORLD.width * scale, size.width / 2 - pose.x * scale));
  const y = showMap
    ? (size.height - WORLD.height * scale) / 2
    : Math.min(0, Math.max(size.height - WORLD.height * scale, size.height / 2 - pose.y * scale));

  return (
    <div className="world-shell">
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
          style={{
            width: WORLD.width,
            height: WORLD.height,
            transform: `translate(${x}px, ${y}px) scale(${scale})`,
            backgroundImage: `url(${adventureAsset('forest-v2.png', assetBase)})`,
          }}
        >
          {CREATURES.map((c, i) => (
            <div
              key={c.id}
              className={`world-entity world-habitat ${(clock + i * 7) % 64 < 52 ? 'is-visible' : 'is-hidden'}`}
              style={{ left: c.x, top: c.y }}
              onClick={() => {
                if (Math.hypot(c.x - pose.x, c.y - pose.y) < 55 && visibleCreatures.includes(c)) {
                  keys.current.clear();
                  stick.current = { x: 0, y: 0 };
                  onEncounter(c.id);
                } else setDialogue('Aproxime-se da moita para encontrar esta criatura.');
              }}
            >
              <span className="world-entity-badge">{c.name}</span>
              <PixelCreature color={c.color} kind={c.id} />
            </div>
          ))}

          {WORLD_OBJECTS.map((o) => (
            <div
              key={o.id}
              className="world-entity world-object"
              style={{ left: o.x, top: o.y }}
              onClick={() => interaction.current()}
            >
              <span className="world-entity-badge">{o.name}</span>
              {o.id === 'guide' ? (
                <PixelAvatar avatar={{ ...avatar, hairColor: 3, outfit: 1 }} />
              ) : o.id === 'chest' ? (
                <TreasureChest />
              ) : (
                <MessageSquare size={20} />
              )}
            </div>
          ))}

          {/* Player with Floating Username Tag (Matching Image 3) */}
          <div className="world-entity world-player" style={{ left: pose.x, top: pose.y }}>
            <span className="world-player-name">{username}</span>
            <PixelAvatar avatar={avatar} direction={pose.direction} walking={pose.walking} />
          </div>
        </div>

        {/* DIALOGUE BUBBLE */}
        {dialogue && (
          <div className="world-dialogue-card" role="status">
            <p>{dialogue}</p>
            <button
              aria-label="Fechar diálogo"
              className="world-dialogue-close"
              onClick={() => setDialogue(null)}
            >
              <X size={15} />
            </button>
          </div>
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
        <div className="world-controls">
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
          WASD ou setas para mover · Espaço / E para ação · Criaturas iniciam batalhas educativas.
        </p>
      </div>
    </div>
  );
}
