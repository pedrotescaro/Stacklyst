import type { Avatar } from './types';

/** Persisted indices and sprite rows must stay stable for existing avatars. */
export const LEGACY_HAIR_COLORS = [
  '#17191f',
  '#684331',
  '#bd8240',
  '#dcd8d4',
  '#805d9e',
  '#c15e54',
];
export const LEGACY_HAIR_NAMES = ['Preto', 'Castanho', 'Loiro', 'Prata', 'Roxo', 'Ruivo'];
export const NATURAL_HAIR_OPTIONS = [
  { color: '#34231c', name: 'Castanho escuro' },
  { color: '#8b5e3c', name: 'Castanho claro' },
  { color: '#d4a44c', name: 'Loiro dourado' },
  { color: '#f0d49a', name: 'Loiro claro' },
  { color: '#a34c27', name: 'Acobreado' },
  { color: '#e9e2d8', name: 'Platinado' },
];

export function avatarHairColor(avatar: Avatar) {
  return typeof avatar.hairTint === 'string' && /^#[\da-f]{6}$/i.test(avatar.hairTint)
    ? avatar.hairTint.toLowerCase()
    : (LEGACY_HAIR_COLORS[avatar.hairColor] ?? LEGACY_HAIR_COLORS[0]);
}

export function withAvatarHairColor(avatar: Avatar, color: string): Avatar {
  if (!/^#[\da-f]{6}$/i.test(color)) throw new Error('Invalid hair color');
  const next = { ...avatar };
  delete next.hairTint;
  const index = LEGACY_HAIR_COLORS.indexOf(color.toLowerCase());
  return index >= 0
    ? { ...next, hairColor: index }
    : { ...next, hairColor: 3, hairTint: color.toLowerCase() };
}

/** Transfer the existing silver pixels to a new base, preserving ink, shading and alpha. */
export function hairColorTransfer(color: string) {
  if (!/^#[\da-f]{6}$/i.test(color)) throw new Error('Invalid hair color');
  const source = [220, 216, 212];
  return source.map((base, channel) => {
    const target = parseInt(color.slice(1 + channel * 2, 3 + channel * 2), 16);
    return Array.from({ length: 256 }, (_, value) =>
      ((value < 96 ? value : Math.max(0, Math.min(255, target + value - base))) / 255).toFixed(6)
    ).join(' ');
  });
}
