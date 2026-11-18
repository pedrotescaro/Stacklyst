import { useEffect, useRef, useState } from 'react';

/** How long a hit reads on screen: two white flashes, a shake and the spark. */
export const HIT_MS = 520;

/** Pixel impact star drawn over a combatant the moment a blow lands. */
export function HitSpark() {
  return (
    <span className="battle-hit-spark" aria-hidden="true">
      <span />
    </span>
  );
}

export type Hit = { amount: number; key: number };

/**
 * Turns falling hit points into short-lived hits, one per combatant, so a
 * battle that only receives new totals (like the multiplayer duel) can still
 * flash, shake and show the damage taken.
 */
export function useHits(hp: Record<string, number> | undefined, battleId: string | undefined) {
  const previous = useRef<{ battleId?: string; hp: Record<string, number> }>({ hp: {} });
  const [hits, setHits] = useState<Record<string, Hit>>({});
  const serial = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!hp) return;
    const before = previous.current.battleId === battleId ? previous.current.hp : hp;
    previous.current = { battleId, hp: { ...hp } };
    const fresh: Record<string, Hit> = {};
    for (const [id, value] of Object.entries(hp)) {
      const old = before[id];
      if (typeof old === 'number' && value < old)
        fresh[id] = { amount: old - value, key: ++serial.current };
    }
    if (!Object.keys(fresh).length) return;
    setHits((current) => ({ ...current, ...fresh }));
    // New totals keep arriving while a hit plays, so its timer must outlive
    // this effect run; it only removes the hit it was started for.
    timers.current.push(
      setTimeout(
        () =>
          setHits((current) =>
            Object.fromEntries(
              Object.entries(current).filter(([id, hit]) => fresh[id]?.key !== hit.key)
            )
          ),
        HIT_MS + 300
      )
    );
  }, [hp, battleId]);
  return hits;
}
