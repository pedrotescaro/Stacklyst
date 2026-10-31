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
  {
    name: 'Jaqueta de aventura',
    kind: 'jacket',
    jacket: '#c04f57',
    shadow: '#8e2d34',
    shirt: '#dae4ec',
    pants: '#293346',
    shoes: '#171e2d',
  },
  // 1: Moletom Azul
  {
    name: 'Moletom azul',
    kind: 'hoodie',
    jacket: '#42a0d3',
    shadow: '#2c78a0',
    shirt: '#f0f6ff',
    pants: '#222f3e',
    shoes: '#ffffff',
  },
  // 2: Jaqueta Tech / Dev
  {
    name: 'Jaqueta tech',
    kind: 'tech',
    jacket: '#273447',
    shadow: '#1a2432',
    shirt: '#38bdf8',
    pants: '#151c24',
    shoes: '#0d131a',
  },
  // 3: Casaco Verde Florestal
  {
    name: 'Casaco florestal',
    kind: 'coat',
    jacket: '#4d855e',
    shadow: '#315d3e',
    shirt: '#e2f0d9',
    pants: '#3e3223',
    shoes: '#271f16',
  },
  // 4: Suéter Carmim
  {
    name: 'Suéter carmim',
    kind: 'sweater',
    jacket: '#9b2c3a',
    shadow: '#6e1e28',
    shirt: '#f8e9eb',
    pants: '#a69575',
    shoes: '#544933',
  },
  // 5: Traje Dourado
  {
    name: 'Traje dourado',
    kind: 'ceremonial',
    jacket: '#eab308',
    shadow: '#b48404',
    shirt: '#ffffff',
    pants: '#1e1b4b',
    shoes: '#0f0e26',
  },
  {
    name: 'Bomber coral',
    kind: 'bomber',
    jacket: '#db826f',
    shadow: '#a8524b',
    shirt: '#fff0d8',
    pants: '#384c62',
    shoes: '#f3deca',
  },
  {
    name: 'Jaqueta jeans',
    kind: 'denim',
    jacket: '#699cbd',
    shadow: '#3e668b',
    shirt: '#f7e5bd',
    pants: '#bd907a',
    shoes: '#433847',
  },
  {
    name: 'Cardigã lavanda',
    kind: 'cardigan',
    jacket: '#a698c9',
    shadow: '#75688f',
    shirt: '#f5e6e3',
    pants: '#514a70',
    shoes: '#efe4dc',
  },
  {
    name: 'Sobretudo noturno',
    kind: 'overcoat',
    jacket: '#50617b',
    shadow: '#343e59',
    shirt: '#b4cfde',
    pants: '#2c3048',
    shoes: '#443c4e',
  },
  {
    name: 'Uniforme marinheiro',
    kind: 'sailor',
    jacket: '#eef1e9',
    shadow: '#b8c9d2',
    shirt: '#5388b2',
    pants: '#3e5884',
    shoes: '#e5d8c8',
  },
  {
    name: 'Túnica do bosque',
    kind: 'tunic',
    jacket: '#87aaa1',
    shadow: '#527b77',
    shirt: '#f0d7a0',
    pants: '#535674',
    shoes: '#7d584b',
  },
];

export const OUTFIT = OUTFIT_SPECS.map((s) => s.jacket);
