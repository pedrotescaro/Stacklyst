import type { CSSProperties } from 'react';
import { DEFAULT_AVATAR, type Avatar } from '../../lib/mundinho/types';

export interface SkinPalette {
  id: string;
  name: string;
  highlight: string;
  base: string;
  shadow: string;
  deepShadow: string;
  blush: string;
}

/**
 * 9 Shaded Skin Palettes with 4-level shading ramps + blush,
 * matching the user reference grid and original 32x32 spr_stacklyst001 chibi.
 */
export const SKIN_PALETTES: SkinPalette[] = [
  // 0: Pêssego Claro / Porcelana (Ref row 1 col 1)
  {
    id: 'peach_fair',
    name: 'Pêssego Claro',
    highlight: '#fff3ea',
    base: '#fcd4b8',
    shadow: '#eab090',
    deepShadow: '#ca8968',
    blush: '#fcaaa0',
  },
  // 1: Lilás Fantasia (Ref row 1 col 2)
  {
    id: 'lilac_fantasy',
    name: 'Lilás Fantasia',
    highlight: '#f8ecfa',
    base: '#e8d3e8',
    shadow: '#c5a5c5',
    deepShadow: '#9b769b',
    blush: '#e2b3e8',
  },
  // 2: Morena Âmbar (Ref row 1 col 3)
  {
    id: 'warm_tan',
    name: 'Morena Âmbar',
    highlight: '#e2ba93',
    base: '#c89b70',
    shadow: '#a8784d',
    deepShadow: '#81542e',
    blush: '#b86d48',
  },
  // 3: Bege Rosado (Ref row 2 col 1)
  {
    id: 'rosy_peach',
    name: 'Bege Rosado',
    highlight: '#fde3d2',
    base: '#f6be9d',
    shadow: '#db9874',
    deepShadow: '#b4714f',
    blush: '#f0907d',
  },
  // 4: Azul Névoa / Fantasia (Ref row 2 col 2)
  {
    id: 'slate_fantasy',
    name: 'Azul Névoa',
    highlight: '#e4e8f7',
    base: '#c7cbe3',
    shadow: '#9fa5c7',
    deepShadow: '#737ba0',
    blush: '#a2aae0',
  },
  // 5: Marfim Pálido (Ref row 2 col 3 - selected checkmark in Image 4)
  {
    id: 'pale_ivory',
    name: 'Marfim Pálido',
    highlight: '#fff8f0',
    base: '#fde5d0',
    shadow: '#e8c4a9',
    deepShadow: '#c49c7f',
    blush: '#f9bfa8',
  },
  // 6: Dourado Trigo (Ref row 3 col 1)
  {
    id: 'warm_wheat',
    name: 'Dourado Trigo',
    highlight: '#f5e7b8',
    base: '#e2cb8b',
    shadow: '#bea462',
    deepShadow: '#927a3c',
    blush: '#d8ab5b',
  },
  // 7: Areia Suave (Ref row 3 col 2)
  {
    id: 'almond_sand',
    name: 'Areia Suave',
    highlight: '#fbf6ee',
    base: '#e7ded0',
    shadow: '#c4b7a4',
    deepShadow: '#998b76',
    blush: '#d2af9c',
  },
  // 8: Cacau Profundo (Ref row 3 col 3)
  {
    id: 'deep_cocoa',
    name: 'Cacau Profundo',
    highlight: '#d8a998',
    base: '#ba8b7a',
    shadow: '#926352',
    deepShadow: '#6a3f30',
    blush: '#844238',
  },
];

export const SKIN = SKIN_PALETTES.map((p) => p.base);

export const HAIR = [
  '#273047', // Preto Ônix
  '#684331', // Castanho Chocolate
  '#bd8240', // Loiro Âmbar
  '#dcd8d4', // Prata Platina
  '#805d9e', // Roxo Místico
  '#c15e54', // Ruivo Carmim
];

export const HAIR_SHADES = [
  { base: '#273047', highlight: '#425175', shadow: '#151c2e' },
  { base: '#684331', highlight: '#8a5c45', shadow: '#452b1e' },
  { base: '#bd8240', highlight: '#deb06a', shadow: '#8c5d28' },
  { base: '#dcd8d4', highlight: '#ffffff', shadow: '#a8a4a0' },
  { base: '#805d9e', highlight: '#a782c7', shadow: '#593e70' },
  { base: '#c15e54', highlight: '#e2837a', shadow: '#8a3c34' },
];

export const EYE_COLORS = [
  '#1a1a1a', // Ônix Escuro
  '#2f855a', // Verde Esmeralda
  '#2b6cb0', // Azul Safira
  '#b7791f', // Âmbar Dourado
  '#805ad5', // Roxo Cibernético
];

export const OUTFIT_SPECS = [
  // 0: Jaqueta Vermelha de Aventura (matching Image 3 & 4)
  { jacket: '#c04f57', shadow: '#8e2d34', shirt: '#dae4ec', pants: '#293346', shoes: '#171e2d' },
  // 1: Moletom Azul
  { jacket: '#42a0d3', shadow: '#2c78a0', shirt: '#f0f6ff', pants: '#222f3e', shoes: '#ffffff' },
  // 2: Jaqueta Tech / Dev
  { jacket: '#273447', shadow: '#1a2432', shirt: '#38bdf8', pants: '#151c24', shoes: '#0d131a' },
  // 3: Casaco Verde Florestal
  { jacket: '#4d855e', shadow: '#315d3e', shirt: '#e2f0d9', pants: '#3e3223', shoes: '#271f16' },
  // 4: Suéter Carmim
  { jacket: '#9b2c3a', shadow: '#6e1e28', shirt: '#f8e9eb', pants: '#a69575', shoes: '#544933' },
  // 5: Traje Dourado
  { jacket: '#eab308', shadow: '#b48404', shirt: '#ffffff', pants: '#1e1b4b', shoes: '#0f0e26' },
];

export const OUTFIT = OUTFIT_SPECS.map((s) => s.jacket);

const r = (x: number, y: number, w: number, h: number, fill: string, key?: string) => (
  <rect key={key ?? `${x}:${y}:${w}x${h}:${fill}`} x={x} y={y} width={w} height={h} fill={fill} />
);

/**
 * 32x32 Shaded Chibi Pixel Avatar Component.
 * Faithfully preserves the author's spr_stacklyst001.ase chibi anatomy with 4-level
 * professional pixel art shading, 9 skin tones, layered outfits, hair, eyes, and accessories.
 */
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
  const pal = SKIN_PALETTES[avatar.skin] ?? SKIN_PALETTES[5];
  const H = pal.highlight;
  const B = pal.base;
  const S = pal.shadow;
  const D = pal.deepShadow;
  const BL = pal.blush;

  const hairStyle = avatar.hair;
  const curHair = HAIR_SHADES[avatar.hairColor] ?? HAIR_SHADES[0];
  const curEye = EYE_COLORS[avatar.eyes] ?? EYE_COLORS[0];
  const outfitSpec = avatar.outfit >= 0 ? (OUTFIT_SPECS[avatar.outfit] ?? OUTFIT_SPECS[0]) : null;

  const isBack = direction === 'up';
  const isLeft = direction === 'left';
  const isRight = direction === 'right';
  const isSide = isLeft || isRight;

  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="Avatar do jogador em pixel art"
      className={`pixel-avatar ${walking ? 'pixel-walk' : ''} ${className}`}
      style={style}
      shapeRendering="crispEdges"
    >
      <g transform={isLeft ? 'translate(31 0) scale(-1 1)' : undefined}>
        {/* ========================================================= */}
        {/* 1. LEGS & FEET (Layer underneath torso)                    */}
        {/* ========================================================= */}
        <g className="pixel-legs">
          {outfitSpec ? (
            <>
              {/* Left Leg (Pants + Boot) */}
              {r(10, 23, 1, 2, '#000000')}
              {r(14, 23, 1, 2, '#000000')}
              {r(11, 23, 3, 1, outfitSpec.pants)}
              {r(11, 24, 3, 1, outfitSpec.shoes)}
              {r(11, 25, 3, 1, '#000000')}

              {/* Right Leg (Pants + Boot) */}
              {r(16, 23, 1, 2, '#000000')}
              {r(20, 23, 1, 2, '#000000')}
              {r(17, 23, 3, 1, outfitSpec.pants)}
              {r(17, 24, 3, 1, outfitSpec.shoes)}
              {r(17, 25, 3, 1, '#000000')}

              {/* Crotch divider */}
              {r(14, 23, 3, 1, '#000000')}
            </>
          ) : (
            <>
              {/* Naked Left Leg with Shading */}
              {r(10, 23, 1, 2, '#000000')}
              {r(14, 23, 1, 2, '#000000')}
              {r(11, 23, 2, 1, B)}
              {r(13, 23, 1, 1, S)}
              {r(11, 24, 2, 1, S)}
              {r(13, 24, 1, 1, D)}
              {r(11, 25, 3, 1, '#000000')}

              {/* Naked Right Leg with Shading */}
              {r(16, 23, 1, 2, '#000000')}
              {r(20, 23, 1, 2, '#000000')}
              {r(17, 23, 2, 1, S)}
              {r(19, 23, 1, 1, D)}
              {r(17, 24, 1, 1, S)}
              {r(18, 24, 2, 1, D)}
              {r(17, 25, 3, 1, '#000000')}

              {/* Crotch divider */}
              {r(14, 23, 3, 1, '#000000')}
            </>
          )}
        </g>

        {/* ========================================================= */}
        {/* 2. TORSO & ARMS                                           */}
        {/* ========================================================= */}
        {outfitSpec ? (
          <>
            {/* Clothed Torso Outlines */}
            {r(8, 16, 1, 2, '#000000')}
            {r(22, 16, 1, 2, '#000000')}
            {r(7, 18, 1, 1, '#000000')}
            {r(23, 18, 1, 1, '#000000')}
            {r(10, 19, 1, 4, '#000000')}
            {r(20, 19, 1, 4, '#000000')}

            {/* Neck drop shadow */}
            {r(9, 16, 13, 1, D)}

            {/* Upper Chest / Shoulders */}
            {r(9, 17, 9, 1, outfitSpec.jacket)}
            {r(18, 17, 4, 1, outfitSpec.shadow)}
            {!isBack && r(14, 17, 3, 1, outfitSpec.shirt)}

            {r(8, 18, 1, 1, outfitSpec.jacket)}
            {r(9, 18, 9, 1, outfitSpec.jacket)}
            {r(18, 18, 5, 1, outfitSpec.shadow)}
            {!isBack && r(14, 18, 3, 1, outfitSpec.shirt)}

            {/* Jacket Body */}
            {r(11, 19, 7, 3, outfitSpec.jacket)}
            {r(18, 19, 2, 3, outfitSpec.shadow)}
            {!isBack && r(14, 19, 3, 3, outfitSpec.shirt)}

            {/* Jacket Bottom Hem */}
            {r(11, 22, 9, 1, outfitSpec.shadow)}

            {/* Left Arm & Sleeve */}
            {r(6, 19, 1, 3, '#000000')}
            {r(9, 19, 1, 3, '#000000')}
            {r(7, 19, 2, 2, outfitSpec.jacket)}
            {/* Left Hand */}
            {r(7, 21, 1, 1, B)}
            {r(8, 21, 1, 1, S)}
            {r(6, 22, 3, 1, '#000000')}

            {/* Right Arm & Sleeve */}
            {r(21, 19, 1, 3, '#000000')}
            {r(24, 19, 1, 3, '#000000')}
            {r(22, 19, 2, 2, outfitSpec.shadow)}
            {/* Right Hand */}
            {r(22, 21, 1, 1, S)}
            {r(23, 21, 1, 1, D)}
            {r(22, 22, 3, 1, '#000000')}
          </>
        ) : (
          <>
            {/* Naked Shaded Torso */}
            {r(8, 16, 1, 2, '#000000')}
            {r(22, 16, 1, 2, '#000000')}
            {r(7, 18, 1, 1, '#000000')}
            {r(23, 18, 1, 1, '#000000')}
            {r(10, 19, 1, 4, '#000000')}
            {r(20, 19, 1, 4, '#000000')}

            {/* Occlusion Neck Shadow */}
            {r(9, 16, 1, 1, S)}
            {r(10, 16, 11, 1, D)}
            {r(21, 16, 1, 1, S)}

            {/* Chest Highlight & Midtones */}
            {r(9, 17, 5, 1, H)}
            {r(14, 17, 5, 1, B)}
            {r(19, 17, 3, 1, S)}

            {r(8, 18, 1, 1, S)}
            {r(9, 18, 10, 1, B)}
            {r(19, 18, 4, 1, S)}

            {/* Midsection */}
            {r(11, 19, 6, 2, B)}
            {r(17, 19, 3, 2, S)}

            {r(11, 21, 5, 1, B)}
            {r(16, 21, 4, 1, S)}

            {/* Lower Abdomen Shadow */}
            {r(11, 22, 5, 1, S)}
            {r(16, 22, 4, 1, D)}

            {/* Left Arm */}
            {r(6, 19, 1, 2, '#000000')}
            {r(9, 19, 1, 2, '#000000')}
            {r(7, 19, 1, 1, H)}
            {r(8, 19, 1, 1, B)}
            {r(7, 20, 1, 1, B)}
            {r(8, 20, 1, 1, S)}
            {r(6, 21, 3, 1, '#000000')}

            {/* Right Arm */}
            {r(21, 19, 1, 2, '#000000')}
            {r(24, 19, 1, 2, '#000000')}
            {r(22, 19, 2, 1, S)}
            {r(22, 20, 1, 1, S)}
            {r(23, 20, 1, 1, D)}
            {r(22, 21, 3, 1, '#000000')}
          </>
        )}

        {/* ========================================================= */}
        {/* 3. HEAD & FACE                                            */}
        {/* ========================================================= */}
        {/* Head Black Outlines */}
        {r(13, 3, 3, 1, '#000000')}
        {r(9, 4, 13, 1, '#000000')}
        {r(8, 5, 1, 10, '#000000')}
        {r(22, 5, 1, 10, '#000000')}
        {r(9, 15, 13, 1, '#000000')}

        {/* Head Shaded Volume Fill */}
        {/* Row 5: Top highlight crest */}
        {r(9, 5, 5, 1, H)}
        {r(14, 5, 6, 1, B)}
        {r(20, 5, 2, 1, S)}

        {/* Row 6: Top-left highlight glint */}
        {r(9, 6, 4, 1, H)}
        {r(13, 6, 7, 1, B)}
        {r(20, 6, 2, 1, S)}

        {/* Row 7: Highlight bevel corner */}
        {r(9, 7, 2, 1, H)}
        {r(11, 7, 9, 1, B)}
        {r(20, 7, 2, 1, S)}

        {/* Rows 8..13: Main Face area */}
        {r(9, 8, 11, 6, B)}
        {r(20, 8, 2, 6, S)}

        {/* Row 14: Lower jaw shadow */}
        {r(9, 14, 9, 1, B)}
        {r(18, 14, 4, 1, S)}

        {/* Facial Features (Face visible if not looking back) */}
        {!isBack && (
          <>
            {/* Eyebrows at y=10 */}
            {r(10, 10, 2, 1, '#000000')}
            {r(19, 10, 2, 1, '#000000')}

            {/* 2x2 Eyes with Eye Color & catchlight glint */}
            {r(10, 12, 2, 2, curEye)}
            {r(10, 13, 1, 1, '#000000')}
            {r(10, 12, 1, 1, '#ffffff')}

            {r(19, 12, 2, 2, curEye)}
            {r(19, 13, 1, 1, '#000000')}
            {r(19, 12, 1, 1, '#ffffff')}

            {/* Mouth at y=13 */}
            {r(14, 13, 3, 1, D)}

            {/* Cute Cheek Blush at y=14 */}
            {r(10, 14, 2, 1, BL)}
            {r(19, 14, 2, 1, BL)}
          </>
        )}

        {/* ========================================================= */}
        {/* 4. HAIR LAYER                                             */}
        {/* ========================================================= */}
        {hairStyle >= 0 && (
          <>
            {isBack ? (
              // Full hair covering back of head
              <g>
                {r(10, 3, 11, 1, curHair.highlight)}
                {r(9, 4, 13, 1, curHair.highlight)}
                {r(9, 5, 13, 2, curHair.base)}
                {r(9, 7, 13, 7, curHair.base)}
                {r(18, 5, 4, 9, curHair.shadow)}
                {r(9, 14, 13, 1, curHair.shadow)}
              </g>
            ) : (
              // Front Hairstyle Options
              <g>
                {hairStyle === 0 && (
                  // Short Modern Anime Cut with Fringe (Image 3 & 4 style)
                  <>
                    {/* Crown & top volume */}
                    {r(9, 4, 6, 1, curHair.highlight)}
                    {r(15, 4, 4, 1, curHair.base)}
                    {r(19, 4, 3, 1, curHair.shadow)}

                    {r(8, 5, 6, 1, curHair.highlight)}
                    {r(14, 5, 5, 1, curHair.base)}
                    {r(19, 5, 3, 1, curHair.shadow)}

                    {r(8, 6, 5, 1, curHair.highlight)}
                    {r(13, 6, 6, 1, curHair.base)}
                    {r(19, 6, 4, 1, curHair.shadow)}

                    {/* Fringe / Bangs falling on forehead */}
                    {r(8, 7, 2, 2, curHair.base)}
                    {r(13, 7, 2, 2, curHair.base)}
                    {r(21, 7, 2, 2, curHair.shadow)}

                    {/* Sideburns */}
                    {r(8, 9, 1, 2, curHair.base)}
                    {r(22, 9, 1, 2, curHair.shadow)}
                  </>
                )}

                {hairStyle === 1 && (
                  // Long Flowing Hair
                  <>
                    {r(9, 4, 13, 2, curHair.base)}
                    {r(9, 4, 6, 1, curHair.highlight)}
                    {r(8, 6, 3, 11, curHair.base)}
                    {r(21, 6, 3, 11, curHair.shadow)}
                  </>
                )}

                {hairStyle === 2 && (
                  // Wavy / Curly Bob
                  <>
                    {r(9, 4, 13, 2, curHair.base)}
                    {r(8, 5, 3, 4, curHair.highlight)}
                    {r(21, 5, 3, 4, curHair.shadow)}
                    {r(7, 8, 3, 4, curHair.base)}
                    {r(22, 8, 3, 4, curHair.shadow)}
                  </>
                )}

                {hairStyle === 3 && (
                  // Spiky Anime Hair
                  <>
                    {r(11, 2, 3, 3, curHair.highlight)}
                    {r(16, 1, 3, 4, curHair.base)}
                    {r(20, 2, 3, 3, curHair.shadow)}
                    {r(9, 4, 13, 2, curHair.base)}
                    {r(8, 6, 2, 3, curHair.base)}
                    {r(21, 6, 2, 3, curHair.shadow)}
                  </>
                )}
              </g>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* 5. ACCESSORIES                                            */}
        {/* ========================================================= */}
        {avatar.accessory === 1 && !isBack && (
          // Modern Frame Glasses
          <g>
            {/* Left rim */}
            {r(9, 11, 4, 1, '#182e42')}
            {r(9, 12, 1, 1, '#182e42')}
            {r(12, 12, 1, 1, '#182e42')}
            {r(9, 13, 4, 1, '#182e42')}
            {r(11, 12, 1, 1, '#8dcfe9')}

            {/* Bridge */}
            {r(13, 12, 5, 1, '#182e42')}

            {/* Right rim */}
            {r(18, 11, 4, 1, '#182e42')}
            {r(18, 12, 1, 1, '#182e42')}
            {r(21, 12, 1, 1, '#182e42')}
            {r(18, 13, 4, 1, '#182e42')}
            {r(20, 12, 1, 1, '#8dcfe9')}
          </g>
        )}

        {avatar.accessory === 2 && isBack && (
          // Adventurer Backpack
          <g>
            {r(10, 18, 11, 5, '#bd8752')}
            {r(12, 19, 7, 3, '#805436')}
          </g>
        )}

        {avatar.accessory === 3 && (
          // Adventurer Hat / Beanie
          <g>
            {r(8, 2, 15, 3, '#bd8752')}
            {r(6, 4, 19, 2, '#dfa958')}
            {r(8, 5, 15, 1, '#714d37')}
          </g>
        )}

        {/* Optional magical sparkles / effect */}
        {effect && (
          <g>
            {r(3, 12, 1, 2, '#ffdd67')}
            {r(27, 20, 1, 2, '#ffdd67')}
            {r(4, 28, 2, 1, '#ffdd67')}
          </g>
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
      {r(5, 21, 16, 2, '#102b3480')}
      {r(3, 12, 19, 9, '#1b3438')}
      {r(6, 8, 13, 13, color)}
      {r(3, 14, 19, 5, color)}
      {r(8, 6, 9, 3, color)}
      {r(6, 19, 13, 2, '#00000022')}
      {r(7, 10, 4, 2, '#ffffff55')}
      {r(7, 14, 3, 4, '#193246')}
      {r(15, 14, 3, 4, '#193246')}
      {r(8, 14, 1, 1, '#fff')}
      {r(16, 14, 1, 1, '#fff')}
      {r(11, 18, 3, 1, '#193246')}
      {kind === 'ember' && (
        <>
          {r(10, 2, 3, 6, '#ffc95b')}
          {r(14, 4, 2, 4, '#ed7948')}
        </>
      )}
      {kind === 'forest' && (
        <>
          {r(12, 1, 2, 6, '#315c40')}
          {r(7, 1, 6, 3, '#79c94b')}
          {r(14, 0, 5, 3, '#b1df58')}
        </>
      )}
      {kind === 'byte-bug' && (
        <>
          {r(4, 4, 2, 5, color)}
          {r(19, 4, 2, 5, color)}
          {r(1, 14, 3, 2, color)}
          {r(21, 17, 3, 2, color)}
        </>
      )}
      {kind === 'null-ghost' && (
        <>
          {r(6, 20, 3, 3, color)}
          {r(12, 20, 3, 3, color)}
          {r(18, 20, 3, 3, color)}
        </>
      )}
    </svg>
  );
}

export function PixelTileMap({
  src,
  alt = 'Mapa do Mundinho',
  className = '',
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`pixel-scenery-img ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

export function Coin({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={`gold-coin ${className}`}>
      <circle cx="20" cy="21" r="17" fill="#8e5917" />
      <circle cx="20" cy="19" r="17" fill="#edaf25" />
      <circle cx="20" cy="19" r="13" fill="#ffda58" stroke="#ffe895" strokeWidth="2" />
      {/* Cute cat face / meow emblem inside the golden coin matching the reference */}
      <circle cx="20" cy="20.5" r="7" fill="#cf8a1e" />
      {/* Cat ears */}
      <polygon points="15,16 13,12 17,14" fill="#cf8a1e" />
      <polygon points="25,16 27,12 23,14" fill="#cf8a1e" />
      {/* Cat eyes */}
      <circle cx="18" cy="19" r="1" fill="#ffe169" />
      <circle cx="22" cy="19" r="1" fill="#ffe169" />
      {/* Cat nose */}
      <polygon points="20,21 19,22 21,22" fill="#ffe169" />
    </svg>
  );
}

export function TreasureChest({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={`pixel-chest ${className}`}>
      {r(4, 26, 24, 3, '#10271e80')}
      {r(5, 14, 22, 12, '#9b5e2b')}
      {r(4, 14, 24, 1, '#44250e')}
      {r(4, 25, 24, 1, '#44250e')}
      {r(4, 14, 1, 12, '#44250e')}
      {r(27, 14, 1, 12, '#44250e')}
      {r(6, 8, 20, 6, '#b7763c')}
      {r(5, 8, 22, 1, '#44250e')}
      {r(8, 14, 3, 11, '#f3cb48')}
      {r(21, 14, 3, 11, '#f3cb48')}
      {r(8, 8, 3, 6, '#f3cb48')}
      {r(21, 8, 3, 6, '#f3cb48')}
      {r(14, 16, 4, 5, '#f3cb48')}
      {r(15, 18, 2, 2, '#2a1708')}
    </svg>
  );
}
