import type { Person } from '../../lib/types';
import { calculateLevel } from '../../../../../src/lib/learning/rewards';

// Kept in sync with src/lib/avatar.ts without importing the web validation bundle.
const avatarBackgrounds = [
  '#2f6bb2',
  '#8e63ce',
  '#2b9c86',
  '#d96168',
  '#d28a2c',
  '#435d9d',
  '#82507d',
  '#56636f',
];
const avatarBounds: Record<string, number> = {
  skin: 15,
  hair: 6,
  hairColor: 8,
  eyes: 4,
  mouth: 4,
  glasses: 4,
  outfit: 5,
  outfitColor: 8,
  background: 8,
};

export function profileBannerColor(username: string, config: unknown) {
  let hash = 2166136261;
  for (const char of (username || 'stacklyst').toLowerCase()) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const fallback = ((hash >>> 0) >>> 20) % avatarBackgrounds.length;
  if (!config || typeof config !== 'object' || Array.isArray(config))
    return avatarBackgrounds[fallback];
  const values = config as Record<string, unknown>;
  const invalidNumber = Object.entries(avatarBounds).some(
    ([key, max]) =>
      key in values &&
      (!Number.isInteger(values[key]) || Number(values[key]) < 0 || Number(values[key]) >= max)
  );
  const invalidName = ['name', 'displayName'].some(
    (key) =>
      key in values &&
      values[key] !== undefined &&
      (typeof values[key] !== 'string' || values[key].length > 50)
  );
  return avatarBackgrounds[
    invalidNumber || invalidName ? fallback : Number(values.background ?? fallback)
  ];
}

export function profileName(user: Person) {
  return user.name || user.avatar_config?.name || user.avatar_config?.displayName || user.username;
}

export function profileLevel(totalXp = 0) {
  return Math.max(1, Math.floor(Math.max(0, totalXp) / 1000) + 1);
}

export const languageMetadata: Record<string, { label: string; color: string; code: string }> = {
  JS: { label: 'JavaScript', color: '#f0db4f', code: 'JS' },
  JAVASCRIPT: { label: 'JavaScript', color: '#f0db4f', code: 'JS' },
  TS: { label: 'TypeScript', color: '#1cb0f6', code: 'TS' },
  TYPESCRIPT: { label: 'TypeScript', color: '#1cb0f6', code: 'TS' },
  PYTHON: { label: 'Python', color: '#58cc02', code: 'PYTHON' },
  JAVA: { label: 'Java', color: '#ff7043', code: 'JAVA' },
  RUST: { label: 'Rust', color: '#ce82ff', code: 'RUST' },
  GO: { label: 'Go', color: '#2fc5d4', code: 'GO' },
};

export function trailProgress(trail: { xp: number; level: number }) {
  const { prevLevelXp, nextLevelXp } = calculateLevel(trail.xp);
  return Math.min(
    100,
    Math.max(0, Math.round(((trail.xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100))
  );
}
