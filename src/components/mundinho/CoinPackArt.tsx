import type { ReactElement } from 'react';
import { brandGeometry } from '../../lib/brand-geometry';

// Cartoon illustrations for the coin top-up packs: one drawing per pack, from a
// handful of coins to a whole mountain. Every coin carries the brand "S".
export type CoinPackId = 'punhado' | 'bolsa' | 'bau' | 'cofre' | 'tesouro' | 'montanha';

const INK = '#4a2a0c';
const EDGE = '#b0661a';
const GOLD = '#f4b223';
const SHINE = '#ffd54a';
const MARK = '#c07f1c';

function FaceCoin({ x, y, r }: { x: number; y: number; r: number }) {
  const s = (0.0172 * r) / 17;
  return (
    <g>
      <circle cx={x} cy={y + r * 0.16} r={r} fill={EDGE} stroke={INK} strokeWidth={1.5} />
      <circle cx={x} cy={y} r={r} fill={GOLD} stroke={INK} strokeWidth={1.5} />
      <circle cx={x} cy={y} r={r * 0.72} fill={SHINE} />
      <path
        d={brandGeometry.path}
        fill={MARK}
        transform={`translate(${x - (brandGeometry.width / 2) * s} ${y - (brandGeometry.height / 2) * s}) scale(${s})`}
      />
      <ellipse
        cx={x - r * 0.42}
        cy={y - r * 0.46}
        rx={r * 0.2}
        ry={r * 0.1}
        fill="#fff6c4"
        transform={`rotate(-40 ${x - r * 0.42} ${y - r * 0.46})`}
      />
    </g>
  );
}

// A coin lying flat, seen from slightly above; `y` is the centre of its top face.
function FlatCoin({ x, y, w }: { x: number; y: number; w: number }) {
  const h = w * 0.42;
  const t = w * 0.28;
  return (
    <g>
      <path
        d={`M${x - w} ${y} v${t} a${w} ${h} 0 0 0 ${2 * w} 0 v${-t}`}
        fill={EDGE}
        stroke={INK}
        strokeWidth={1.5}
      />
      <ellipse cx={x} cy={y} rx={w} ry={h} fill={GOLD} stroke={INK} strokeWidth={1.5} />
      <ellipse cx={x} cy={y} rx={w * 0.66} ry={h * 0.6} fill={SHINE} />
    </g>
  );
}

function Stack({ x, y, w, count }: { x: number; y: number; w: number; count: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <FlatCoin key={i} x={x} y={y - i * w * 0.28} w={w} />
      ))}
    </g>
  );
}

function Sparkle({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <path
      className="coin-pack-sparkle"
      d={`M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`}
      fill="#fff4b8"
    />
  );
}

function Shadow({ rx }: { rx: number }) {
  return <ellipse cx={48} cy={87} rx={rx} ry={5} fill="rgba(0, 0, 0, 0.28)" />;
}

// A heap of coins with faces showing, used to fill chests, safes and sacks.
function Heap({ d, coins }: { d: string; coins: [number, number, number][] }) {
  return (
    <g>
      <path d={d} fill={GOLD} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      {coins.map(([x, y, r]) => (
        <FaceCoin key={`${x}-${y}`} x={x} y={y} r={r} />
      ))}
    </g>
  );
}

function Handful() {
  return (
    <>
      <Shadow rx={30} />
      <FaceCoin x={62} y={50} r={12} />
      <Stack x={32} y={72} w={13} count={4} />
      <FaceCoin x={52} y={64} r={15} />
      <FlatCoin x={74} y={78} w={9} />
    </>
  );
}

function Pouch() {
  return (
    <>
      <Shadow rx={32} />
      <FaceCoin x={43} y={22} r={7} />
      <FaceCoin x={54} y={20} r={6} />
      <path
        d="M40 34C30 40 17 52 17 66C17 80 30 86 48 86C66 86 79 80 79 66C79 52 66 40 56 34Z"
        fill="#a8692f"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M66 46C74 54 76 64 74 72C72 80 64 83 56 84C66 78 70 64 66 46Z" fill="#8a5224" />
      <ellipse cx={30} cy={56} rx={4} ry={8} fill="#c98a4c" transform="rotate(25 30 56)" />
      <path
        d="M37 34C33 26 36 19 42 23C44 15 52 15 54 23C60 19 63 26 59 34Z"
        fill="#b87a3d"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <rect
        x={35}
        y={31}
        width={26}
        height={6}
        rx={3}
        fill="#e7b75f"
        stroke={INK}
        strokeWidth={1.6}
      />
      <path
        d="M58 36C62 42 60 48 57 50M58 36C64 40 66 46 64 49"
        fill="none"
        stroke="#e7b75f"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <FaceCoin x={48} y={62} r={12} />
      <FaceCoin x={78} y={79} r={7} />
      <FlatCoin x={19} y={82} w={7} />
    </>
  );
}

function Chest() {
  return (
    <>
      <Shadow rx={38} />
      <path
        d="M17 44L21 19Q22 15 26 15L70 15Q74 15 75 19L79 44Z"
        fill="#17655d"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M24 40L27 21L69 21L72 40Z" fill="#1f8478" />
      <Heap
        d="M16 47C22 35 34 31 48 33C62 31 74 35 80 47Z"
        coins={[
          [30, 40, 7],
          [62, 39, 7],
          [46, 35, 8],
          [38, 45, 6],
          [55, 45, 6],
        ]}
      />
      <rect
        x={14}
        y={45}
        width={68}
        height={37}
        rx={4}
        fill="#2bb3a3"
        stroke={INK}
        strokeWidth={2}
      />
      <path d="M16 64H80" stroke="#1d7f75" strokeWidth={2} />
      <path d="M18 50H78" stroke="#5fd6c7" strokeWidth={2} strokeLinecap="round" />
      <rect x={12} y={42} width={72} height={8} rx={3} fill={GOLD} stroke={INK} strokeWidth={1.8} />
      <rect x={22} y={49} width={6} height={33} fill={GOLD} stroke={INK} strokeWidth={1.5} />
      <rect x={68} y={49} width={6} height={33} fill={GOLD} stroke={INK} strokeWidth={1.5} />
      <rect
        x={41}
        y={48}
        width={14}
        height={16}
        rx={2.5}
        fill={GOLD}
        stroke={INK}
        strokeWidth={1.8}
      />
      <circle cx={48} cy={54} r={2.2} fill={INK} />
      <path d="M48 55V60" stroke={INK} strokeWidth={2} strokeLinecap="round" />
    </>
  );
}

function Vault() {
  return (
    <>
      <Shadow rx={38} />
      <rect
        x={22}
        y={78}
        width={9}
        height={6}
        rx={1.5}
        fill="#2a5bb0"
        stroke={INK}
        strokeWidth={1.5}
      />
      <rect
        x={65}
        y={78}
        width={9}
        height={6}
        rx={1.5}
        fill="#2a5bb0"
        stroke={INK}
        strokeWidth={1.5}
      />
      <Heap
        d="M20 34C26 21 38 17 48 19C60 17 72 22 76 34Z"
        coins={[
          [33, 27, 7],
          [63, 27, 7],
          [48, 21, 8],
          [41, 31, 5],
          [56, 31, 5],
        ]}
      />
      <rect
        x={17}
        y={32}
        width={62}
        height={49}
        rx={6}
        fill="#3d7fe0"
        stroke={INK}
        strokeWidth={2}
      />
      <rect
        x={23}
        y={38}
        width={50}
        height={37}
        rx={4}
        fill="#4f92f0"
        stroke="#2a5bb0"
        strokeWidth={2}
      />
      <path d="M26 41H70" stroke="#8cbcff" strokeWidth={2} strokeLinecap="round" />
      <rect
        x={19}
        y={43}
        width={5}
        height={7}
        rx={1.5}
        fill="#c9d6ea"
        stroke={INK}
        strokeWidth={1.2}
      />
      <rect
        x={19}
        y={63}
        width={5}
        height={7}
        rx={1.5}
        fill="#c9d6ea"
        stroke={INK}
        strokeWidth={1.2}
      />
      <circle cx={41} cy={57} r={9.5} fill="#c9d6ea" stroke={INK} strokeWidth={1.8} />
      <circle cx={41} cy={57} r={5.5} fill="#8ea3c4" stroke={INK} strokeWidth={1.2} />
      <path d="M41 47.5V51M41 63V66.5M31.5 57H35M47 57H50.5" stroke={INK} strokeWidth={1.4} />
      <path d="M41 57L44 53" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <rect
        x={60}
        y={47}
        width={5}
        height={20}
        rx={2.5}
        fill="#c9d6ea"
        stroke={INK}
        strokeWidth={1.6}
      />
      <circle cx={62.5} cy={57} r={3.5} fill="#e7eef8" stroke={INK} strokeWidth={1.4} />
      <FaceCoin x={80} y={79} r={8} />
      <FlatCoin x={14} y={82} w={7} />
    </>
  );
}

function Treasure() {
  return (
    <>
      <Shadow rx={40} />
      <path
        d="M16 45C16 13 80 13 80 45Z"
        fill="#5e2fa3"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M23 42C24 21 72 21 73 42Z" fill="#7440c0" />
      <path d="M30 22C30 30 30 36 30 44M66 22C66 30 66 36 66 44" stroke={GOLD} strokeWidth={4} />
      <Heap
        d="M12 48C17 28 33 23 48 25C63 23 79 28 84 48Z"
        coins={[
          [24, 40, 7],
          [72, 40, 7],
          [40, 31, 7],
          [57, 30, 8],
          [32, 45, 6],
          [48, 42, 7],
          [64, 46, 6],
        ]}
      />
      <path
        d="M33 30L37 25L41 30L37 36Z"
        fill="#ff4f7a"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path
        d="M58 37L62 33L66 37L62 42Z"
        fill="#3ee08f"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <rect
        x={14}
        y={46}
        width={68}
        height={36}
        rx={5}
        fill="#8a4fd6"
        stroke={INK}
        strokeWidth={2}
      />
      <path d="M18 52H78" stroke="#b285f2" strokeWidth={2} strokeLinecap="round" />
      <rect x={12} y={43} width={72} height={8} rx={3} fill={GOLD} stroke={INK} strokeWidth={1.8} />
      <path
        d="M14 70V82H26M82 70V82H70"
        fill="none"
        stroke={GOLD}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <rect
        x={40}
        y={50}
        width={16}
        height={18}
        rx={3}
        fill={GOLD}
        stroke={INK}
        strokeWidth={1.8}
      />
      <circle cx={48} cy={58} r={4} fill="#ff4f7a" stroke={INK} strokeWidth={1.4} />
      <circle cx={46.6} cy={56.6} r={1.2} fill="#ffd0dc" />
      <FaceCoin x={84} y={80} r={7} />
      <FaceCoin x={12} y={81} r={6} />
      <Sparkle x={13} y={22} s={5} />
      <Sparkle x={84} y={20} s={6} />
      <Sparkle x={48} y={9} s={4} />
    </>
  );
}

const MOUNTAIN: [number, number, number][] = [
  [48, 28, 8],
  [38, 40, 8],
  [58, 40, 8],
  [28, 54, 8],
  [48, 52, 9],
  [68, 54, 8],
  [18, 68, 8],
  [38, 66, 9],
  [58, 66, 9],
  [78, 68, 8],
  [12, 80, 7],
  [30, 80, 8],
  [48, 79, 9],
  [66, 80, 8],
  [84, 80, 7],
];

function Mountain() {
  return (
    <>
      <Shadow rx={44} />
      <Heap d="M6 85C14 60 30 28 48 24C66 28 82 60 90 85Z" coins={MOUNTAIN} />
      <Sparkle x={20} y={30} s={5} />
      <Sparkle x={78} y={24} s={6} />
      <Sparkle x={89} y={50} s={4} />
    </>
  );
}

const ART: Record<CoinPackId, () => ReactElement> = {
  punhado: Handful,
  bolsa: Pouch,
  bau: Chest,
  cofre: Vault,
  tesouro: Treasure,
  montanha: Mountain,
};

export function CoinPackArt({ pack, className = '' }: { pack: CoinPackId; className?: string }) {
  const Art = ART[pack];
  return (
    <svg
      viewBox="0 0 96 96"
      aria-hidden="true"
      className={`coin-pack-art ${className}`}
      data-pack={pack}
    >
      <Art />
    </svg>
  );
}
