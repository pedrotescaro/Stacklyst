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

type Phase = 'ready' | 'act' | 'item' | 'mercy' | 'message' | 'aim' | 'dodge' | 'won' | 'lost';
const COMMANDS = ['FIGHT', 'ACT', 'ITEM', 'MERCY'] as const;
function Heart() {
  return (
    <svg
      viewBox="0 0 9 8"
      aria-hidden="true"
      className="veil-heart-icon"
      shapeRendering="crispEdges"
    >
      <path
        fill="currentColor"
        d="M1 0h2v1h1v1h1V1h1V0h2v1h1v3H8v1H7v1H6v1H5v1H4V7H3V6H2V5H1V4H0V1h1z"
      />
    </svg>
  );
}
function CommandIcon({ index }: { index: number }) {
  const paths = [
    'M11 0h3v3l-7 7 2 2-2 2-3-3-3 3-1-1 3-3-3-3 2-2 2 2z',
    'M2 1h11v9H7l-4 4v-4H2zM4 3v1h7V3zM4 6v1h5V6z',
    'M4 0h6v2H4zM5 3h4v2l3 3v5H2V8l3-3zM4 9v2h6V9z',
    'M1 1h2l4 4 4-4h2v2L9 7l4 4v2h-2L7 9l-4 4H1v-2l4-4-4-4z',
  ];
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" shapeRendering="crispEdges">
      <path fill="currentColor" fillRule="evenodd" d={paths[index]} />
    </svg>
  );
}
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
  calm: 0,
  items: 3,
  message: '',
  spared: false,
  soul: freshSoul(),
  shots: [] as Shot[],
});
export function VeilBoss({
  assetBase,
  onLeave,
  username = 'Jogador',
  level = 1,
}: {
  assetBase: string;
  onLeave: () => void;
  username?: string;
  level?: number;
}) {
  const { text: t } = useLocalizedText();
  const game = useRef(makeGame()),
    keys = useRef(new Set<string>()),
    target = useRef<Soul | null>(null);
  const field = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const [selected, select] = useState(0);
  const [snapshot, render] = useState(game.current);
  const [paused, setPaused] = useState(false);
  const update = () => render({ ...game.current });
  const startDodge = () => {
    const g = game.current;
    Object.assign(g, {
      phase: 'dodge',
      elapsed: 0,
      turn: g.turn + 1,
      beat: 0,
      soul: freshSoul(),
      shots: [],
      grace: 0,
    });
    target.current = null;
    keys.current.clear();
    update();
  };
  const strike = () => {
    const g = game.current;
    if (g.phase !== 'aim' || paused) return;
    g.damage = strikeDamage(aimMarker(g.elapsed));
    g.boss = Math.max(0, g.boss - g.damage);
    if (g.boss) startDodge();
    else {
      g.phase = 'won';
      update();
    }
  };
  const choose = (index: number) => {
    if (game.current.phase !== 'ready' || paused) return;
    select(index);
    game.current.phase = (['aim', 'act', 'item', 'mercy'] as const)[index];
    game.current.elapsed = 0;
    update();
  };
  const say = (message: string) => {
    game.current.message = message;
    game.current.phase = 'message';
    update();
  };
  const back = () => {
    game.current.phase = 'ready';
    update();
  };
  const talk = () => {
    const g = game.current;
    g.calm = Math.min(3, g.calm + 1);
    say(
      g.calm === 3
        ? t(
            'O guardião abaixa as asas. Agora você pode poupá-lo.',
            'The guardian lowers its wings. You can spare it now.'
          )
        : t(
            `Sua voz acalma o guardião. Confiança: ${g.calm}/3.`,
            `Your voice soothes the guardian. Trust: ${g.calm}/3.`
          )
    );
  };
  const heal = () => {
    const g = game.current;
    if (!g.items || g.health === 20) return;
    const restored = Math.min(10, 20 - g.health);
    g.health += restored;
    g.items--;
    say(
      t(
        `Você come uma fruta. Recuperou ${restored} HP.`,
        `You eat a fruit. Recovered ${restored} HP.`
      )
    );
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
    if (paused) return;
    if (snapshot.phase === 'dodge') field.current?.focus({ preventScroll: true });
    else
      root.current
        ?.querySelector<HTMLButtonElement>(
          snapshot.phase === 'ready'
            ? `[data-command="${selected}"]`
            : '[data-veil-choice]:not(:disabled)'
        )
        ?.focus({ preventScroll: true });
  }, [snapshot.phase, paused, selected]);
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
      ? snapshot.calm === 3
        ? t('O guardião espera sua misericórdia.', 'The guardian awaits your mercy.')
        : turn
          ? t('A guarda baixou. É a sua vez.', 'Its guard dropped. Your turn.')
          : t('O Guardião da Fenda bloqueia seu caminho.', 'The Rift Guardian blocks your path.')
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
                snapshot.spared
                  ? 'Você poupou o guardião. A fenda está em paz.'
                  : 'O guardião se curva. A fenda está em silêncio.',
                snapshot.spared
                  ? 'You spared the guardian. The rift is at peace.'
                  : 'The guardian bows. The rift falls silent.'
              )
            : t(
                'A luz se apagou. Você pode tentar de novo.',
                'Your light went out. You can try again.'
              );
  const active = phase === 'aim' || phase === 'dodge';
  const menu = ['act', 'item', 'mercy'].includes(phase);
  return (
    <section
      ref={root}
      className="veil-boss"
      aria-label={t('Duelo do Guardião', 'Guardian duel')}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'x') {
          e.preventDefault();
          if (active) {
            keys.current.clear();
            target.current = null;
            setPaused(!paused);
          } else if (menu) back();
          return;
        }
        if (paused || phase === 'dodge') return;
        const direction = arrows[e.key];
        if (direction && (phase === 'ready' || menu)) {
          e.preventDefault();
          const buttons = Array.from(
            root.current?.querySelectorAll<HTMLButtonElement>(
              phase === 'ready' ? '[data-command]' : '[data-veil-choice]:not(:disabled)'
            ) ?? []
          );
          const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
          const next =
            (current + (direction === 'right' || direction === 'down' ? 1 : -1) + buttons.length) %
            buttons.length;
          buttons[next]?.focus();
          if (phase === 'ready') select(next);
        } else if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (!e.repeat) (document.activeElement as HTMLButtonElement)?.click?.();
        }
      }}
    >
      <div className="veil-sky">
        <div
          role="img"
          aria-label={t('Guardião alado', 'Winged guardian')}
          className="veil-guardian"
          style={{ backgroundImage: `url(${adventureAsset('boss-veil.png', assetBase)})` }}
        />
        {phase === 'aim' && (
          <div
            className="veil-enemy-health"
            role="meter"
            aria-label={t('Vida do guardião', 'Guardian HP')}
            aria-valuemin={0}
            aria-valuemax={60}
            aria-valuenow={boss}
          >
            <i style={{ width: `${(boss / 60) * 100}%` }} />
          </div>
        )}
      </div>
      <div className="veil-box-slot">
        <div
          className={`veil-field ${phase === 'dodge' ? 'veil-field-dodge' : ''}`}
          ref={field}
          tabIndex={phase === 'dodge' ? 0 : -1}
          aria-label={t(
            'Área de batalha. Use as setas, WASD ou arraste o coração para esquivar.',
            'Battle field. Use arrows, WASD or drag the heart to dodge.'
          )}
          onKeyDown={(e) => {
            if (phase === 'dodge' && !paused && arrows[e.key]) {
              e.preventDefault();
              target.current = null;
              keys.current.add(arrows[e.key]);
            }
          }}
          onKeyUp={(e) => keys.current.delete(arrows[e.key])}
          onBlur={() => keys.current.clear()}
          onPointerDown={(e) => {
            if (phase === 'dodge' && !paused) {
              e.currentTarget.focus();
              e.currentTarget.setPointerCapture(e.pointerId);
              point(e);
            }
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId) && !paused) point(e);
          }}
          onPointerUp={() => {
            target.current = null;
          }}
          onPointerCancel={() => {
            target.current = null;
          }}
        >
          {phase === 'aim' ? (
            <>
              <div className="veil-meter">
                <i style={{ left: `${aimMarker(elapsed) * 100}%` }} />
              </div>
              <button className="veil-strike" data-veil-choice onClick={strike} disabled={paused}>
                {t('Golpear', 'Strike')}
              </button>
            </>
          ) : phase === 'dodge' ? (
            <>
              <span
                className={'veil-heart' + (grace > 0 ? ' veil-hit' : '')}
                style={{
                  left: `${(soul.x / FIELD.width) * 100}%`,
                  top: `${(soul.y / FIELD.height) * 100}%`,
                }}
              >
                <Heart />
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
          ) : (
            <div className="veil-dialogue">
              {menu ? (
                <div className="veil-options">
                  {phase === 'act' && (
                    <>
                      <button
                        data-veil-choice
                        onClick={() =>
                          say(
                            t(
                              'GUARDIÃO · ATQ 3 · DEF 0. Ele protege a fenda. Converse três vezes para ganhar sua confiança.',
                              'GUARDIAN · ATK 3 · DEF 0. It protects the rift. Talk three times to gain its trust.'
                            )
                          )
                        }
                      >
                        {t('Examinar', 'Check')}
                      </button>
                      <button data-veil-choice onClick={talk}>
                        {t('Conversar', 'Talk')} ({snapshot.calm}/3)
                      </button>
                    </>
                  )}
                  {phase === 'item' && (
                    <>
                      <button
                        data-veil-choice
                        onClick={heal}
                        disabled={!snapshot.items || health === 20}
                      >
                        {t('Fruta', 'Fruit')} ×{snapshot.items} · +10 HP
                      </button>
                      <p>
                        {t('3 frutas para este duelo.', '3 fruits for this duel.')}{' '}
                        {health === 20 && t('Sua vida está cheia.', 'Your HP is full.')}
                      </p>
                    </>
                  )}
                  {phase === 'mercy' && (
                    <>
                      <button
                        data-veil-choice
                        className="veil-spare"
                        disabled={snapshot.calm < 3}
                        onClick={() => {
                          game.current.spared = true;
                          game.current.phase = 'won';
                          update();
                        }}
                      >
                        {t('Poupar', 'Spare')}
                      </button>
                      <button data-veil-choice onClick={onLeave}>
                        {t('Fugir', 'Flee')}
                      </button>
                      {snapshot.calm < 3 && (
                        <p>
                          {t('Converse para acalmar o guardião.', 'Talk to soothe the guardian.')}
                        </p>
                      )}
                    </>
                  )}
                  <button data-veil-choice onClick={back}>
                    {t('Voltar', 'Back')}
                  </button>
                </div>
              ) : (
                <>
                  <p aria-live="polite">* {phase === 'message' ? snapshot.message : hint}</p>
                  {phase === 'message' && (
                    <button data-veil-choice onClick={startDodge}>
                      {t('Continuar', 'Continue')}
                    </button>
                  )}
                  {phase === 'lost' && (
                    <button
                      data-veil-choice
                      onClick={() => {
                        game.current = makeGame();
                        select(0);
                        update();
                      }}
                    >
                      {t('Tentar de novo', 'Retry')}
                    </button>
                  )}
                  {phase === 'won' && (
                    <button data-veil-choice onClick={onLeave}>
                      {t('Voltar à clareira', 'Return to the clearing')}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
          {paused && (
            <div className="veil-paused">
              <span>{t('Pausado', 'Paused')}</span>
              <button onClick={() => setPaused(false)}>{t('Continuar', 'Resume')}</button>
            </div>
          )}
        </div>
      </div>
      <div className="veil-stats">
        <strong className="veil-name" title={username}>
          {username}
        </strong>
        <strong>LV {level}</strong>
        <div className="veil-hp">
          <span>HP</span>
          <span
            className="veil-hp-bar"
            role="meter"
            aria-label={t('Sua vida', 'Your HP')}
            aria-valuemin={0}
            aria-valuemax={20}
            aria-valuenow={health}
          >
            <i style={{ width: `${health * 5}%` }} />
          </span>
          <strong>{health} / 20</strong>
        </div>
      </div>
      <div
        className="veil-commands"
        role="group"
        aria-label={t('Comandos de batalha', 'Battle commands')}
      >
        {COMMANDS.map((label, i) => (
          <button
            key={label}
            data-command={i}
            aria-pressed={selected === i}
            disabled={phase !== 'ready' || paused}
            onFocus={() => select(i)}
            onClick={() => choose(i)}
          >
            {selected === i ? <Heart /> : <CommandIcon index={i} />}
            <span>{label}</span>
          </button>
        ))}
      </div>
      <p className="veil-help" aria-live="polite">
        {active
          ? hint
          : t(
              'Setas / WASD · Enter / Z confirma · Esc / X volta',
              'Arrows / WASD · Enter / Z confirms · Esc / X goes back'
            )}
        <br />
        {t(
          'No celular, toque nos comandos e arraste o coração.',
          'On mobile, tap commands and drag the heart.'
        )}
      </p>
      <div className="veil-actions">
        {active && (
          <button
            onClick={() => {
              keys.current.clear();
              target.current = null;
              setPaused(!paused);
            }}
          >
            {paused ? t('Continuar', 'Resume') : t('Pausar', 'Pause')}
          </button>
        )}
        <button onClick={onLeave}>{t('Voltar à clareira', 'Return to the clearing')}</button>
      </div>
    </section>
  );
}
