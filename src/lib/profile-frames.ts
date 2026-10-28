import type { AvatarFrameDefinition } from '@/lib/profile-customization';

/** Curated colors only: no user CSS or remote assets enter the avatar ring. */
const rings = [
  [
    'pride-rainbow',
    'Orgulho LGBTQIA+',
    'pride',
    '#e40303',
    '#ff8c00',
    '#ffed00',
    '#008026',
    '#24408e',
    '#732982',
  ],
  ['pride-trans', 'Trans', 'pride', '#5bcefa', '#f5a9b8', '#ffffff', '#f5a9b8', '#5bcefa'],
  ['pride-bi', 'Bissexual', 'pride', '#d60270', '#d60270', '#9b4f96', '#0038a8', '#0038a8'],
  ['pride-pan', 'Pansexual', 'pride', '#ff218c', '#ffd800', '#21b1ff'],
  ['pride-lesbian', 'Lésbica', 'pride', '#d52d00', '#ef7627', '#ffffff', '#d162a4', '#a30262'],
  ['pride-nonbinary', 'Não binário', 'pride', '#fff430', '#ffffff', '#9c59d1', '#2d2d2d'],
  ['pride-ace', 'Assexual', 'pride', '#222222', '#a3a3a3', '#ffffff', '#800080'],
  ['pride-aro', 'Arromântico', 'pride', '#3da542', '#a7d379', '#ffffff', '#a9a9a9', '#222222'],
  [
    'pride-genderfluid',
    'Gênero fluido',
    'pride',
    '#ff75a2',
    '#ffffff',
    '#be18d6',
    '#222222',
    '#333ebd',
  ],
  ['country-br', 'Brasil', 'country', '#009739', '#ffdf00', '#002776', '#ffffff'],
  ['country-pt', 'Portugal', 'country', '#006600', '#ff0000', '#ffcc00'],
  ['country-ar', 'Argentina', 'country', '#74acdf', '#ffffff', '#f6b40e', '#74acdf'],
  ['country-uy', 'Uruguai', 'country', '#ffffff', '#0038a8', '#ffffff', '#fcd116'],
  ['country-mx', 'México', 'country', '#006847', '#ffffff', '#ce1126'],
  ['country-us', 'Estados Unidos', 'country', '#b31942', '#ffffff', '#0a3161'],
  ['country-ca', 'Canadá', 'country', '#d80621', '#ffffff', '#d80621'],
  ['country-fr', 'França', 'country', '#002395', '#ffffff', '#ed2939'],
  ['country-de', 'Alemanha', 'country', '#222222', '#dd0000', '#ffce00'],
  ['country-it', 'Itália', 'country', '#009246', '#ffffff', '#ce2b37'],
  ['country-es', 'Espanha', 'country', '#aa151b', '#f1bf00', '#aa151b'],
  ['country-jp', 'Japão', 'country', '#ffffff', '#bc002d', '#ffffff'],
  ['country-ao', 'Angola', 'country', '#ce1126', '#222222', '#ffcb00'],
  ['country-cv', 'Cabo Verde', 'country', '#003893', '#ffffff', '#cf2027', '#f7d116'],
] as const;

export const EXTRA_PROFILE_FRAMES: AvatarFrameDefinition[] = [
  ...rings.map(([id, name, decoration, color]) => ({ id, name, decoration, color })),
  { id: 'propeller', name: 'Chapéu com hélice', color: '#0083fe', decoration: 'propeller' },
  { id: 'orbit', name: 'Órbita', color: '#38bdf8', decoration: 'orbit' },
  { id: 'laurel', name: 'Louros', color: '#d4af37', decoration: 'laurel' },
  { id: 'aurora', name: 'Aurora', color: '#2dd4bf', decoration: 'aurora' },
];

export function getFrameRingBackground(id: string) {
  const ring = rings.find((item) => item[0] === id);
  const colors = ring?.slice(3) as string[] | undefined;
  return colors
    ? `conic-gradient(${colors.map((color, index) => `${color} ${(index * 100) / colors.length}% ${((index + 1) * 100) / colors.length}%`).join(', ')})`
    : undefined;
}
