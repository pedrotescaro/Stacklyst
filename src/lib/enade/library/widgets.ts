/** Widget names authors can use with `::widget <name>` (rendered by biblioteca/widgets/Widget.tsx). */
export const WIDGET_NAMES = [
  'truth-table',
  'rup-whale',
  'cyclomatic',
  'stack-queue',
  'linked-list',
  'bst',
  'sorting',
  'big-o',
  'lorenz-gini',
  'venn',
  'base-converter',
  'stats-calculator',
  'scheduling',
  'layers-flow',
  'hash-table',
  'graph-traversal',
  'osi-layers',
  'uml',
] as const;
export type WidgetName = (typeof WIDGET_NAMES)[number];

/** Methodology sections every article must contain (others are optional). */
export const REQUIRED_SECTIONS = [
  'o-que-e',
  'para-que-serve',
  'como-funciona',
  'caracteristicas-principais',
  'exemplos-praticos',
  'representacao-visual',
  'diferencas-entre-conceitos-semelhantes',
  'como-cai-no-enade',
  'pegadinhas',
  'resumo-para-memorizar',
  'miniquestionario',
  'referencias',
] as const;
