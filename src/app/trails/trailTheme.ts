export interface TrailSectionTheme {
  number: number;
  headerClass: string;
  primaryHex: string;
  primaryHoverHex: string;
  borderHex: string;
  glowHex: string;
  badgeTextHex: string;
  nodeButtonClass: string;
  stepButtonClass: string;
  checkpointButtonClass: string;
  pathStroke: string;
}

export const SECTION_THEMES: TrailSectionTheme[] = [
  // Seção 1: Azul vibrante (Fundamentos)
  {
    number: 1,
    headerClass: 'border-b-[6px] border-blue-700 bg-blue-500',
    primaryHex: '#3b82f6',
    primaryHoverHex: '#2563eb',
    borderHex: '#1d4ed8',
    glowHex: 'rgba(59, 130, 246, 0.45)',
    badgeTextHex: '#93c5fd',
    nodeButtonClass:
      'border-b-[6px] border-blue-700 bg-blue-500 enabled:hover:bg-blue-600 enabled:active:border-b-2 text-white',
    stepButtonClass:
      'border-b-[5px] border-blue-700 bg-blue-500 hover:bg-blue-600 active:border-b-2 text-white',
    checkpointButtonClass:
      'border-b-[6px] border-blue-700 bg-blue-500 hover:bg-blue-600 active:border-b-2 text-white',
    pathStroke: '#3b82f6',
  },
  // Seção 2: Roxo / Violeta (Estruturas de Controle)
  {
    number: 2,
    headerClass: 'border-b-[6px] border-purple-700 bg-purple-500',
    primaryHex: '#a855f7',
    primaryHoverHex: '#9333ea',
    borderHex: '#7e22ce',
    glowHex: 'rgba(168, 85, 247, 0.45)',
    badgeTextHex: '#d8b4fe',
    nodeButtonClass:
      'border-b-[6px] border-purple-700 bg-purple-500 enabled:hover:bg-purple-600 enabled:active:border-b-2 text-white',
    stepButtonClass:
      'border-b-[5px] border-purple-700 bg-purple-500 hover:bg-purple-600 active:border-b-2 text-white',
    checkpointButtonClass:
      'border-b-[6px] border-purple-700 bg-purple-500 hover:bg-purple-600 active:border-b-2 text-white',
    pathStroke: '#a855f7',
  },
  // Seção 3: Verde Esmeralda (Funções & Escopo)
  {
    number: 3,
    headerClass: 'border-b-[6px] border-emerald-700 bg-emerald-500',
    primaryHex: '#10b981',
    primaryHoverHex: '#059669',
    borderHex: '#047857',
    glowHex: 'rgba(16, 185, 129, 0.45)',
    badgeTextHex: '#a7f3d0',
    nodeButtonClass:
      'border-b-[6px] border-emerald-700 bg-emerald-500 enabled:hover:bg-emerald-600 enabled:active:border-b-2 text-white',
    stepButtonClass:
      'border-b-[5px] border-emerald-700 bg-emerald-500 hover:bg-emerald-600 active:border-b-2 text-white',
    checkpointButtonClass:
      'border-b-[6px] border-emerald-700 bg-emerald-500 hover:bg-emerald-600 active:border-b-2 text-white',
    pathStroke: '#10b981',
  },
  // Seção 4: Âmbar / Ouro (Estruturas de Dados)
  {
    number: 4,
    headerClass: 'border-b-[6px] border-amber-700 bg-amber-500',
    primaryHex: '#f59e0b',
    primaryHoverHex: '#d97706',
    borderHex: '#b45309',
    glowHex: 'rgba(245, 158, 11, 0.45)',
    badgeTextHex: '#fde68a',
    nodeButtonClass:
      'border-b-[6px] border-amber-700 bg-amber-500 enabled:hover:bg-amber-600 enabled:active:border-b-2 text-white',
    stepButtonClass:
      'border-b-[5px] border-amber-700 bg-amber-500 hover:bg-amber-600 active:border-b-2 text-white',
    checkpointButtonClass:
      'border-b-[6px] border-amber-700 bg-amber-500 hover:bg-amber-600 active:border-b-2 text-white',
    pathStroke: '#f59e0b',
  },
  // Seção 5: Rosa / Vermelho (OOP / Tipagem Avançada)
  {
    number: 5,
    headerClass: 'border-b-[6px] border-rose-700 bg-rose-500',
    primaryHex: '#f43f5e',
    primaryHoverHex: '#e11d48',
    borderHex: '#be123c',
    glowHex: 'rgba(244, 63, 94, 0.45)',
    badgeTextHex: '#fecdd3',
    nodeButtonClass:
      'border-b-[6px] border-rose-700 bg-rose-500 enabled:hover:bg-rose-600 enabled:active:border-b-2 text-white',
    stepButtonClass:
      'border-b-[5px] border-rose-700 bg-rose-500 hover:bg-rose-600 active:border-b-2 text-white',
    checkpointButtonClass:
      'border-b-[6px] border-rose-700 bg-rose-500 hover:bg-rose-600 active:border-b-2 text-white',
    pathStroke: '#f43f5e',
  },
  // Seção 6: Ciano / Turquesa (Assincronismo & I/O)
  {
    number: 6,
    headerClass: 'border-b-[6px] border-cyan-700 bg-cyan-500',
    primaryHex: '#06b6d4',
    primaryHoverHex: '#0891b2',
    borderHex: '#0e7490',
    glowHex: 'rgba(6, 182, 212, 0.45)',
    badgeTextHex: '#a5f3fc',
    nodeButtonClass:
      'border-b-[6px] border-cyan-700 bg-cyan-500 enabled:hover:bg-cyan-600 enabled:active:border-b-2 text-white',
    stepButtonClass:
      'border-b-[5px] border-cyan-700 bg-cyan-500 hover:bg-cyan-600 active:border-b-2 text-white',
    checkpointButtonClass:
      'border-b-[6px] border-cyan-700 bg-cyan-500 hover:bg-cyan-600 active:border-b-2 text-white',
    pathStroke: '#06b6d4',
  },
  // Seção 7: Pink / Magenta (Módulos & Qualidade de Código)
  {
    number: 7,
    headerClass: 'border-b-[6px] border-pink-700 bg-pink-500',
    primaryHex: '#ec4899',
    primaryHoverHex: '#db2777',
    borderHex: '#be185d',
    glowHex: 'rgba(236, 72, 153, 0.45)',
    badgeTextHex: '#fbcfe8',
    nodeButtonClass:
      'border-b-[6px] border-pink-700 bg-pink-500 enabled:hover:bg-pink-600 enabled:active:border-b-2 text-white',
    stepButtonClass:
      'border-b-[5px] border-pink-700 bg-pink-500 hover:bg-pink-600 active:border-b-2 text-white',
    checkpointButtonClass:
      'border-b-[6px] border-pink-700 bg-pink-500 hover:bg-pink-600 active:border-b-2 text-white',
    pathStroke: '#ec4899',
  },
  // Seção 8: Laranja / Coral (Engenharia & Projeto Prático)
  {
    number: 8,
    headerClass: 'border-b-[6px] border-orange-700 bg-orange-500',
    primaryHex: '#f97316',
    primaryHoverHex: '#ea580c',
    borderHex: '#c2410c',
    glowHex: 'rgba(249, 115, 22, 0.45)',
    badgeTextHex: '#fed7aa',
    nodeButtonClass:
      'border-b-[6px] border-orange-700 bg-orange-500 enabled:hover:bg-orange-600 enabled:active:border-b-2 text-white',
    stepButtonClass:
      'border-b-[5px] border-orange-700 bg-orange-500 hover:bg-orange-600 active:border-b-2 text-white',
    checkpointButtonClass:
      'border-b-[6px] border-orange-700 bg-orange-500 hover:bg-orange-600 active:border-b-2 text-white',
    pathStroke: '#f97316',
  },
];

export function getSectionTheme(sectionNumber: number): TrailSectionTheme {
  const index = (Math.max(1, sectionNumber) - 1) % SECTION_THEMES.length;
  return SECTION_THEMES[index];
}
