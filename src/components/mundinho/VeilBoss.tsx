'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocalizedText } from '../../i18n/useLocalizedText';
import {
  advanceShots,
  aimMarker,
  FIELD,
  freshSoul,
  limit,
  strikeDamage,
  volley,
  type Shot,
  type Soul,
} from '../../lib/mundinho/veil-boss';
import { adventureAsset } from './assets';
import './veil-boss.css';

type Phase = 'ready' | 'aim' | 'dodge' | 'won' | 'lost';
const arrows: Record<string, string> = {
  ArrowLeft: 'left',
  a: 'left',
  ArrowRight: 'right',
  d: 'right',
  ArrowUp: 'up',
  w: 'up',
  ArrowDown: 'down',
  s: 'down',
};
const makeGame = () => ({
  phase: 'ready' as Phase,
  turn: 0,
  health: 20,
  boss: 60,
  elapsed: 0,
  beat: 0,
  grace: 0,
  damage: 0,
  soul: freshSoul(),
  shots: [] as Shot[],
});
export function VeilBoss({ assetBase, onLeave }: { assetBase: string; onLeave: () => void }) {
  const { text: t } = useLocalizedText();
  const game = useRef(makeGame()),
    keys = useRef(new Set<string>()),
    target = useRef<Soul | null>(null);
  const field = useRef<HTMLDivElement>(null),
    command = useRef<HTMLButtonElement>(null);
  const [snapshot, render] = useState(game.current);
  const [paused, setPaused] = useState(false);
  const update = () => render({ ...game.current });
  const act = () => {
    const g = game.current;
    if (g.phase === 'ready') {
      g.phase = 'aim';
      g.elapsed = 0;
    } else if (g.phase === 'aim') {
      g.damage = strikeDamage(aimMarker(g.elapsed));
      g.boss = Math.max(0, g.boss - g.damage);
      g.phase = g.boss ? 'dodge' : 'won';
      g.elapsed = 0;
      g.turn++;
      g.beat = 0;
      g.soul = freshSoul();
      g.shots = [];
      g.grace = 0;
      target.current = null;
      keys.current.clear();
      if (g.phase === 'dodge') field.current?.focus();
    } else if (g.phase === 'lost') {
      game.current = makeGame();
    }
    update();
  };
  useEffect(() => {
    const blur = () => {
      keys.current.clear();
      target.current = null;
      if (['aim', 'dodge'].includes(game.current.phase)) setPaused(true);
    };
    const visibility = () => {
      if (document.hidden) blur();
    };
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    if (paused || !['aim', 'dodge'].includes(snapshot.phase)) return;
    let id = 0,
      previous = performance.now();
    const step = (now: number) => {
      const g = game.current;
      if (g.phase !== 'aim' && g.phase !== 'dodge') return;
      const dt = Math.min(0.04, (now - previous) / 1000);
      previous = now;
      g.elapsed += dt;
      if (g.phase === 'dodge') {
        const k = keys.current,
          to = target.current;
        let dx = Number(k.has('right')) - Number(k.has('left')),
          dy = Number(k.has('down')) - Number(k.has('up'));
        if (to) {
          dx = to.x - g.soul.x;
          dy = to.y - g.soul.y;
        }
        const length = Math.hypot(dx, dy);
        if (length) {
          const speed = to ? Math.min(105 * dt, length) : 105 * dt;
          g.soul = {
            x: limit(g.soul.x + (dx / length) * speed, 4, FIELD.width - 4),
            y: limit(g.soul.y + (dy / length) * speed, 4, FIELD.height - 4),
          };
        }
        if (g.elapsed >= 0.55 + g.beat * 0.82) {
          g.shots.push(...volley(g.turn, g.beat++, g.soul));
        }
        const { shots, hit } = advanceShots(g.shots, dt, g.soul);
        g.shots = shots;
        g.grace = Math.max(0, g.grace - dt);
        if (hit && !g.grace) {
          g.health = Math.max(0, g.health - 3);
          g.grace = 0.95;
        }
        if (!g.health || g.elapsed >= 5.3) {
          g.phase = g.health ? 'ready' : 'lost';
          g.shots = [];
          target.current = null;
          keys.current.clear();
        }
      }
      update();
      if (g.phase === 'aim' || g.phase === 'dodge') id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [snapshot.phase, paused]);
  useEffect(() => {
    if (snapshot.phase !== 'dodge' && !paused) command.current?.focus({ preventScroll: true });
  }, [snapshot.phase, paused]);
  const { phase, health, boss, soul, shots, elapsed, turn, grace } = snapshot;
  const point = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    target.current = {
      x: ((event.clientX - box.left) * FIELD.width) / box.width,
      y: ((event.clientY - box.top) * FIELD.height) / box.height,
    };
  };
  const hint =
    phase === 'ready'
      ? turn
        ? t('A guarda baixou. É a sua vez.', 'Its guard dropped. Your turn.')
        : t('O guardião acorda. Prepare o golpe.', 'The guardian wakes. Prepare your strike.')
      : phase === 'aim'
        ? t('Acerte o centro para causar mais dano.', 'Strike in the center for more damage.')
        : phase === 'dodge'
          ? [
              t('Desvie da chuva de fragmentos.', 'Dodge the falling shards.'),
              t('Atravesse as brechas nas fileiras.', 'Find the gaps in the crossing rows.'),
              t('O guardião está mirando em você.', 'The guardian is aiming at you.'),
            ][(turn - 1) % 3]
          : phase === 'won'
            ? t(
                'O guardião se curva. A fenda está em silêncio.',
                'The guardian bows. The rift falls silent.'
              )
            : t(
                'A luz se apagou. Você pode tentar de novo.',
                'Your light went out. You can try again.'
              );
  return (
    <section className="veil-boss" aria-label={t('Duelo do Guardião', 'Guardian duel')}>
      <div className="veil-sky">
        <div
          role="img"
          aria-label={t('Guardião alado', 'Winged guardian')}
          className="veil-guardian"
          style={{ backgroundImage: `url(${adventureAsset('boss-veil.png', assetBase)})` }}
        />
      </div>
      <div className="veil-stats">
        <label>
          {t('Guardião', 'Guardian')} <meter min={0} max={60} value={boss} />
        </label>
        <span>
          {t('Sua vida', 'Your HP')} {health}/20
        </span>
      </div>
      <p aria-live="polite">{paused ? t('Pausado', 'Paused') : hint}</p>
      <div
        className="veil-field"
        ref={field}
        tabIndex={0}
        aria-label={t(
          'Área de esquiva. Use as setas, WASD ou arraste o coração.',
          'Dodge field. Use arrows, WASD or drag the heart.'
        )}
        onKeyDown={(e) => {
          if (phase === 'dodge' && arrows[e.key]) {
            e.preventDefault();
            target.current = null;
            keys.current.add(arrows[e.key]);
          }
        }}
        onKeyUp={(e) => keys.current.delete(arrows[e.key])}
        onBlur={() => {
          keys.current.clear();
        }}
        onPointerDown={(e) => {
          if (phase === 'dodge' && !paused) {
            e.currentTarget.setPointerCapture(e.pointerId);
            point(e);
          }
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) point(e);
        }}
        onPointerUp={() => {
          target.current = null;
        }}
        onPointerCancel={() => {
          target.current = null;
        }}
      >
        {phase === 'aim' ? (
          <div className="veil-meter">
            <i style={{ left: `${aimMarker(elapsed) * 100}%` }} />
          </div>
        ) : (
          <>
            <span
              className={'veil-heart' + (grace > 0 ? ' veil-hit' : '')}
              style={{
                left: `${(soul.x / FIELD.width) * 100}%`,
                top: `${(soul.y / FIELD.height) * 100}%`,
              }}
            >
              ♥
            </span>
            {shots.map((s, i) => (
              <span
                aria-hidden="true"
                key={i}
                className="veil-shot"
                style={{
                  left: `${(s.x / FIELD.width) * 100}%`,
                  top: `${(s.y / FIELD.height) * 100}%`,
                  backgroundImage: `url(${adventureAsset('boss-projectile.png', assetBase)})`,
                }}
              />
            ))}
          </>
        )}
      </div>
      <small>
        {t(
          'Setas ou WASD para esquivar · No toque, arraste dentro da caixa.',
          'Arrows or WASD to dodge · On touch, drag inside the box.'
        )}
      </small>
      <div className="veil-actions">
        {phase !== 'won' && phase !== 'dodge' && !paused && (
          <button ref={command} onClick={act}>
            {phase === 'ready'
              ? t('Preparar golpe', 'Ready strike')
              : phase === 'aim'
                ? t('Golpear', 'Strike')
                : t('Tentar de novo', 'Retry')}
          </button>
        )}
        {['aim', 'dodge'].includes(phase) && (
          <button
            onClick={() => {
              setPaused(!paused);
              if (paused && phase === 'dodge') field.current?.focus();
            }}
          >
            {paused ? t('Continuar', 'Resume') : t('Pausar', 'Pause')}
          </button>
        )}
        <button ref={phase === 'won' ? command : undefined} onClick={onLeave}>
          {t('Voltar à clareira', 'Return to the clearing')}
        </button>
      </div>
    </section>
  );
}
