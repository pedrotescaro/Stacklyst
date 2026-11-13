export const FIELD = { width: 240, height: 116 };
export const VEIL_BOSS_HP = 144;
export const DODGE_SECONDS = 6.4;
export const FIRST_VOLLEY = 0.65;
export const VOLLEY_INTERVAL = 0.62;
export type Shot = { x: number; y: number; vx: number; vy: number };
export type Soul = { x: number; y: number };
export const freshSoul = (): Soul => ({ x: 120, y: 88 });
export const limit = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export function aimMarker(seconds: number) {
  return (1 - Math.cos(seconds * Math.PI * 1.65)) / 2;
}
export function strikeDamage(marker: number) {
  return 8 + Math.round(16 * (1 - Math.abs(2 * marker - 1)));
}
/** Three alternating attacks: falling gates, crossing rows, then aimed volleys. */
export function volley(turn: number, beat: number, soul: Soul): Shot[] {
  const shots: Shot[] = [];
  // Speed rises each three-pattern cycle, then caps so the gaps remain traversable.
  const pressure = 1 + Math.min(2, Math.max(0, Math.floor((turn - 1) / 3))) * 0.08;
  if (turn % 3 === 1) {
    const gap = (beat + 2) % 9;
    for (let i = 0; i < 10; i++)
      if (i !== gap && i !== gap + 1)
        shots.push({ x: 12 + i * 24, y: -6, vx: 0, vy: 64 * pressure });
  } else if (turn % 3 === 2) {
    const fromLeft = beat % 2 === 0,
      gap = (beat + 2) % 6;
    for (let i = 0; i < 7; i++)
      if (i !== gap && i !== gap + 1)
        shots.push({
          x: fromLeft ? -6 : 246,
          y: 10 + i * 16,
          vx: (fromLeft ? 104 : -104) * pressure,
          vy: 0,
        });
  } else {
    const x = 24 + ((beat * 53) % 192);
    const angle = Math.atan2(soul.y + 5, soul.x - x);
    for (const offset of [-0.48, -0.24, 0, 0.24, 0.48])
      shots.push({
        x,
        y: -5,
        vx: Math.cos(angle + offset) * 84 * pressure,
        vy: Math.sin(angle + offset) * 84 * pressure,
      });
  }
  return shots;
}
export function advanceShots(shots: Shot[], dt: number, soul: Soul) {
  const next = shots
    .map((s) => ({ ...s, x: s.x + s.vx * dt, y: s.y + s.vy * dt }))
    .filter((s) => s.x >= -8 && s.x <= 248 && s.y >= -8 && s.y <= 124);
  return { shots: next, hit: next.some((s) => Math.hypot(s.x - soul.x, s.y - soul.y) < 6) };
}
