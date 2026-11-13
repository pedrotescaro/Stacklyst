export const FIELD = { width: 240, height: 116 };
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
  if (turn % 3 === 1) {
    const gap = (beat * 2 + 2) % 7;
    for (let i = 0; i < 8; i++)
      if (Math.abs(i - gap) > 1) shots.push({ x: 15 + i * 30, y: -6, vx: 0, vy: 47 });
  } else if (turn % 3 === 2) {
    const fromLeft = beat % 2 === 0,
      gap = (beat + 2) % 5;
    for (let i = 0; i < 5; i++)
      if (i !== gap)
        shots.push({ x: fromLeft ? -6 : 246, y: 12 + i * 23, vx: fromLeft ? 86 : -86, vy: 0 });
  } else {
    const x = 24 + ((beat * 53) % 192);
    const angle = Math.atan2(soul.y + 5, soul.x - x);
    for (const offset of [-0.35, 0, 0.35])
      shots.push({
        x,
        y: -5,
        vx: Math.cos(angle + offset) * 68,
        vy: Math.sin(angle + offset) * 68,
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
