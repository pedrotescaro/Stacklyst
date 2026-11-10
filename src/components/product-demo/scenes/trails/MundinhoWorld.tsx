'use client';

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
import { PixelAvatar, PixelCreature } from '@/components/mundinho/PixelArt';
import { HabitatSprite, WorldPropSprite } from '@/components/mundinho/ScenerySprites';
import { PixelMeter } from '@/components/mundinho/PixelMeter';
import { Portrait } from '@/components/mundinho/Portrait';
import { TouchStick } from '@/components/mundinho/TouchStick';
import { adventureAsset } from '@/components/mundinho/assets';
import { ADA_AVATAR, CREATURES, type Avatar } from '@/lib/mundinho/types';
import { SCENERY, WORLD, WORLD_OBJECTS, worldDepth } from '@/lib/mundinho/world';
import { canChallengeCreature } from '@/lib/mundinho/rules';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import '@/components/mundinho/mundinho.css';

const ASSET_BASE = '/assets/mundinho';
const noop = () => {};

export interface WorldPose {
  x: number;
  y: number;
  direction: 'down' | 'right' | 'up' | 'left';
  walking: boolean;
}

export interface MundinhoWorldProps {
  avatar: Avatar;
  username: string;
  playerLevel: number;
  pose: WorldPose;
  /** Shows Ada's dialogue panel over the clearing. */
  dialogue: boolean;
}

/**
 * Projection of `World` (the Mundinho clearing): the same HUD, tilemap,
 * sprites, entities and controls, driven by a pose supplied by the
 * walkthrough instead of keyboard/touch input and a simulation loop.
 */
export function MundinhoWorld({
  avatar,
  username,
  playerLevel,
  pose,
  dialogue,
}: MundinhoWorldProps) {
  const { text } = useLocalizedText();
  const viewport = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 480 });
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setSize({ width: element.clientWidth, height: element.clientHeight })
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Camera math copied from World: follow the player, never show past the map edge.
  const scale = Math.max(0.85, Math.min(1.2, size.width / 850));
  const x =
    WORLD.width * scale < size.width
      ? (size.width - WORLD.width * scale) / 2
      : Math.min(0, Math.max(size.width - WORLD.width * scale, size.width / 2 - pose.x * scale));
  const y =
    WORLD.height * scale < size.height
      ? (size.height - WORLD.height * scale) / 2
      : Math.min(0, Math.max(size.height - WORLD.height * scale, size.height / 2 - pose.y * scale));

  const objectLabel: Record<string, string> = {
    guide: text('Ada (Guia)', 'Ada (Guide)'),
    sign: text('Placa de dicas', 'Hint sign'),
    chest: text('Baú diário · 10 moedas', 'Daily chest · 10 coins'),
    portal: text('Descer para a arena multiplayer', 'Go down to the multiplayer arena'),
  };
  const guide = WORLD_OBJECTS.find((object) => object.id === 'guide');
  const nearAda = guide ? Math.hypot(guide.x - pose.x, guide.y - pose.y) < 55 : false;

  return (
    <div className="world-shell" data-area="forest">
      <div
        ref={viewport}
        className="world-viewport"
        aria-label={text(
          'Mundinho RPG. Mova-se com WASD ou setas e aperte E ou Espaço para interagir.',
          'Mundinho RPG. Move with WASD or the arrow keys and press E or Space to interact.'
        )}
      >
        <div className="world-top-hud">
          <div className="world-hud-left">
            <span
              className="world-hud-btn"
              aria-label={text('Voltar para Trilhas', 'Back to Trails')}
            >
              <ArrowLeft size={18} />
            </span>
            <span className="world-hud-btn" aria-label={text('Diálogo', 'Dialogue')}>
              <MessageSquare size={18} />
            </span>
            <span
              className="world-hud-btn"
              aria-label={text('Visualizar mapa completo', 'View full map')}
            >
              <MapIcon size={18} />
            </span>
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
            <span
              className="world-hud-btn"
              aria-label={text('Guia de programação', 'Programming guide')}
            >
              <BookOpen size={18} />
            </span>
            <span className="world-hud-btn" aria-label={text('Abrir inventário', 'Open inventory')}>
              <Backpack size={18} />
            </span>
          </div>
        </div>

        <div
          className="world-map"
          inert={dialogue}
          style={{
            width: WORLD.width,
            height: WORLD.height,
            transform: `translate(${x}px, ${y}px) scale(${scale})`,
            backgroundImage: `url(${adventureAsset('forest-ground.png', ASSET_BASE)})`,
          }}
        >
          {SCENERY.objects.map((object) => (
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
                backgroundImage: `url(${adventureAsset('forest-scenery.png', ASSET_BASE)})`,
                backgroundSize: `${SCENERY.width * SCENERY.columns}px ${SCENERY.height * SCENERY.rows}px`,
                backgroundPosition: `${-(object.frame % SCENERY.columns) * SCENERY.width}px ${-Math.floor(object.frame / SCENERY.columns) * SCENERY.height}px`,
              }}
            />
          ))}
          {CREATURES.map((creature, index) => (
            <HabitatSprite
              key={creature.id}
              x={creature.x}
              y={creature.y}
              variant={index}
              assetBase={ASSET_BASE}
            />
          ))}
          {CREATURES.map((creature) => {
            const challengeable = canChallengeCreature(playerLevel, creature.level);
            return (
              <div
                key={creature.id}
                className="world-entity world-habitat is-visible"
                style={{ left: creature.x, top: creature.y, zIndex: worldDepth(creature.y) }}
              >
                <span className={`world-creature-level ${challengeable ? '' : 'is-locked'}`}>
                  <span className="world-creature-label">
                    <span>
                      {text('Nv.', 'Lv.')} {creature.level}
                    </span>
                    {!challengeable && <span>{text('Bloqueado', 'Locked')}</span>}
                  </span>
                  <PixelMeter value={100} label={creature.name} compact />
                </span>
                <PixelCreature color={creature.color} kind={creature.id} />
              </div>
            );
          })}
          {WORLD_OBJECTS.map((object) => (
            <button
              type="button"
              key={object.id}
              aria-label={objectLabel[object.id]}
              className="world-entity world-object"
              style={{ left: object.x, top: object.y, zIndex: worldDepth(object.y) }}
              tabIndex={-1}
            >
              <span className="world-entity-badge">{objectLabel[object.id]}</span>
              {object.id === 'guide' ? (
                <PixelAvatar avatar={ADA_AVATAR} />
              ) : (
                <WorldPropSprite
                  kind={
                    object.id === 'portal'
                      ? 'portal-hole'
                      : object.id === 'chest'
                        ? 'chest'
                        : 'signpost'
                  }
                  assetBase={ASSET_BASE}
                  chestState="closed"
                />
              )}
            </button>
          ))}
          <div
            className="world-entity world-player"
            style={{ left: pose.x, top: pose.y, zIndex: worldDepth(pose.y) }}
          >
            <span className="world-player-name">{username}</span>
            <PixelAvatar avatar={avatar} direction={pose.direction} walking={pose.walking} />
          </div>
        </div>

        {dialogue && (
          <section
            role="dialog"
            aria-label="Ada"
            className="world-dialogue-panel has-portrait"
            data-testid="demo-world-dialogue"
          >
            <Portrait avatar={ADA_AVATAR} name="Ada" assetBase={ASSET_BASE} />
            <div className="world-dialogue-copy">
              <h2>Ada</h2>
              <p>
                {text(
                  `Oi, ${username}! Sou a Ada. Cada erro é uma pista para a próxima tentativa. Sobre o que vamos conversar?`,
                  `Hi, ${username}! I'm Ada. Every mistake is a clue for the next attempt. What shall we talk about?`
                )}
              </p>
              <div className="world-dialogue-actions">
                <button type="button" tabIndex={-1}>
                  <span className="dialogue-choice-pointer" aria-hidden="true" />
                  {text('Como enfrento os bugs?', 'How do I fight the bugs?')}
                </button>
                <button type="button" tabIndex={-1}>
                  <span className="dialogue-choice-pointer" aria-hidden="true" />
                  {text('Quero mudar meu visual.', 'I want to change my look.')}
                </button>
                <button type="button" tabIndex={-1}>
                  <span className="dialogue-choice-pointer" aria-hidden="true" />
                  {text('O que há nesta clareira?', 'What is in this clearing?')}
                </button>
              </div>
            </div>
            <span
              aria-label={text('Fechar diálogo', 'Close dialogue')}
              className="world-dialogue-close"
            >
              <X size={18} />
            </span>
          </section>
        )}

        <div className="world-controls" hidden={dialogue}>
          <TouchStick onMove={noop} />
          <button
            type="button"
            className={`world-action-sword ${nearAda ? 'is-target' : ''}`}
            aria-label={text('Interagir', 'Interact')}
            tabIndex={-1}
          >
            <Swords size={28} />
            {nearAda && <span className="world-action-label">{text('Interagir', 'Interact')}</span>}
          </button>
        </div>
      </div>

      <div className="world-hint-footer">
        <p>
          {text(
            'WASD ou setas para mover · Espaço / E para ação · Criaturas iniciam batalhas educativas.',
            'WASD or arrows to move · Space / E to act · Creatures start educational battles.'
          )}
        </p>
      </div>
    </div>
  );
}
