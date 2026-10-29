import type { CSSProperties } from 'react';
import { DEFAULT_AVATAR, type Avatar } from '../../lib/mundinho/types';

export const SKIN = [
  '#754936',
  '#a86b48',
  '#e5aa7b',
  '#f5c7a0',
  '#c88b64',
  '#8d5f54',
  '#f0d4bb',
  '#52372d',
];
export const HAIR = ['#273047', '#684331', '#bd8240', '#dcd8d4', '#805d9e', '#c15e54'];
export const OUTFIT = ['#587bbb', '#5d967b', '#b98b51', '#c04f57', '#42a0d3', '#304a50'];
const rect = (x: number, y: number, w: number, h: number, fill: string, key?: string) => (
  <rect key={key ?? `${x}:${y}:${fill}`} x={x} y={y} width={w} height={h} fill={fill} />
);

/** Original 24 × 32 layered pixel sprite. All poses share the same appearance layers. */
export function PixelAvatar({
  avatar = DEFAULT_AVATAR,
  direction = 'down',
  walking = false,
  className = '',
  style,
  effect = false,
}: {
  avatar?: Avatar;
  direction?: string;
  walking?: boolean;
  className?: string;
  style?: CSSProperties;
  effect?: boolean;
}) {
  const skin = SKIN[avatar.skin],
    hair = HAIR[avatar.hairColor],
    shirt = OUTFIT[avatar.outfit];
  const back = direction === 'up',
    side = direction === 'left' || direction === 'right';
  return (
    <svg
      viewBox="0 0 24 32"
      role="img"
      aria-label="Seu avatar"
      className={`pixel-avatar ${walking ? 'pixel-walk' : ''} ${className}`}
      style={style}
      shapeRendering="crispEdges"
    >
      <g transform={direction === 'left' ? 'translate(24 0) scale(-1 1)' : undefined}>
        <g className="pixel-legs">
          {rect(6, 25, 5, 5, '#293346')}
          {rect(13, 25, 5, 5, '#293346')}
          {rect(5, 29, 6, 2, '#171e2d')}
          {rect(13, 29, 7, 2, '#171e2d')}
        </g>
        {rect(5, 17, 15, 10, '#1a2639')}
        {rect(6, 18, 12, 8, shirt)}
        {rect(9, 18, 3, 8, '#dae4ec')}
        {rect(3, 18, 3, 7, shirt)}
        {rect(19, 18, 3, 7, shirt)}
        {rect(3, 24, 3, 3, skin)}
        {rect(19, 24, 3, 3, skin)}
        {rect(7, 26, 11, 2, '#172338')}
        {rect(5, 5, 15, 13, '#192234')}
        {rect(6, 6, 13, 11, skin)}
        {rect(4, 10, 2, 5, skin)}
        {rect(19, 10, 2, 5, skin)}
        {!back && (
          <>
            {rect(
              side ? 15 : 8,
              11,
              2,
              avatar.eyes === 3 ? 1 : 3,
              ['#2d464d', '#548457', '#4282ac', '#383a53', '#7d523c'][avatar.eyes]
            )}
            {!side &&
              rect(
                15,
                11,
                2,
                avatar.eyes === 3 ? 1 : 3,
                ['#2d464d', '#548457', '#4282ac', '#383a53', '#7d523c'][avatar.eyes]
              )}
            {rect(11, 15, 3, 1, '#ae6b55')}
          </>
        )}
        {avatar.hair === 0 && (
          <>
            {rect(5, 3, 15, 6, hair)}
            {rect(8, 1, 10, 3, hair)}
            {rect(3, 7, 4, 8, hair)}
            {rect(18, 7, 4, 8, hair)}
            {rect(8, 7, 2, 3, hair)}
            {rect(13, 7, 2, 2, hair)}
          </>
        )}
        {avatar.hair === 1 && (
          <>
            {rect(5, 3, 15, 6, hair)}
            {rect(7, 1, 11, 4, hair)}
            {rect(3, 7, 4, 14, hair)}
            {rect(18, 7, 4, 14, hair)}
          </>
        )}
        {avatar.hair === 2 && (
          <>
            {[3, 7, 11, 15, 19].map((x) => rect(x, 3 + (x % 3), 4, 5, hair))}
            {rect(5, 2, 14, 4, hair)}
            {rect(3, 7, 4, 7, hair)}
            {rect(18, 7, 4, 7, hair)}
          </>
        )}
        {avatar.hair === 3 && (
          <>
            {rect(5, 4, 15, 4, hair)}
            {rect(8, 1, 3, 4, hair)}
            {rect(12, 0, 3, 5, hair)}
            {rect(16, 2, 3, 4, hair)}
            {rect(3, 7, 4, 7, hair)}
            {rect(18, 7, 4, 7, hair)}
          </>
        )}
        {rect(8, 3, 7, 2, '#ffffff22')}
        {back && rect(6, 7, 13, 10, hair)}
        {avatar.accessory === 1 && !back && (
          <>
            {rect(6, 10, 5, 4, '#182e42')}
            {rect(14, 10, 5, 4, '#182e42')}
            {rect(11, 11, 3, 1, '#182e42')}
            {rect(7, 11, 2, 1, '#8dcfe9')}
          </>
        )}
        {avatar.accessory === 2 && back && (
          <>
            {rect(7, 19, 11, 7, '#bd8752')}
            {rect(9, 20, 7, 4, '#805436')}
          </>
        )}
        {avatar.accessory === 3 && (
          <>
            {rect(6, 1, 13, 5, '#bd8752')}
            {rect(2, 6, 21, 3, '#dfa958')}
            {rect(6, 5, 13, 2, '#714d37')}
          </>
        )}
        {effect && (
          <>
            {rect(1, 12, 1, 2, '#ffdd67')}
            {rect(23, 20, 1, 2, '#ffdd67')}
            {rect(2, 29, 2, 1, '#ffdd67')}
          </>
        )}
      </g>
    </svg>
  );
}
export function PixelCreature({
  color = '#8ccc4e',
  kind = 'syntax-slime',
  className = '',
}: {
  color?: string;
  kind?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      shapeRendering="crispEdges"
      className={`pixel-creature ${className}`}
    >
      {rect(5, 21, 16, 2, '#102b3480')}
      {rect(3, 12, 19, 9, '#1b3438')}
      {rect(6, 8, 13, 13, color)}
      {rect(3, 14, 19, 5, color)}
      {rect(8, 6, 9, 3, color)}
      {rect(6, 19, 13, 2, '#00000022')}
      {rect(7, 10, 4, 2, '#ffffff55')}
      {rect(7, 14, 3, 4, '#193246')}
      {rect(15, 14, 3, 4, '#193246')}
      {rect(8, 14, 1, 1, '#fff')}
      {rect(16, 14, 1, 1, '#fff')}
      {rect(11, 18, 3, 1, '#193246')}
      {kind === 'ember' && (
        <>
          {rect(10, 2, 3, 6, '#ffc95b')}
          {rect(14, 4, 2, 4, '#ed7948')}
        </>
      )}
      {kind === 'forest' && (
        <>
          {rect(12, 1, 2, 6, '#315c40')}
          {rect(7, 1, 6, 3, '#79c94b')}
          {rect(14, 0, 5, 3, '#b1df58')}
        </>
      )}
      {kind === 'byte-bug' && (
        <>
          {rect(4, 4, 2, 5, color)}
          {rect(19, 4, 2, 5, color)}
          {rect(1, 14, 3, 2, color)}
          {rect(21, 17, 3, 2, color)}
        </>
      )}
      {kind === 'null-ghost' && (
        <>
          {rect(6, 20, 3, 3, color)}
          {rect(12, 20, 3, 3, color)}
          {rect(18, 20, 3, 3, color)}
        </>
      )}
    </svg>
  );
}
export function Coin({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={`gold-coin ${className}`}>
      <circle cx="20" cy="21" r="17" fill="#97601c" />
      <circle cx="20" cy="19" r="17" fill="#edaf25" />
      <circle cx="20" cy="19" r="13" fill="#ffda58" stroke="#ffe895" strokeWidth="2" />
      <path
        d="m24 11-10 5 10 5-10 5"
        fill="none"
        stroke="#b77b1d"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
