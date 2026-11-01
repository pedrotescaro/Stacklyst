/** Semantic tokens keep saved posts readable in both application themes. */
export const POST_TEXT_COLORS = [
  { value: 'blue', label: 'Azul', light: '#0062bf', dark: '#70b5ff' },
  { value: 'purple', label: 'Roxo', light: '#7542b8', dark: '#c2a0ff' },
  { value: 'green', label: 'Verde', light: '#087849', dark: '#58dbaa' },
  { value: 'rose', label: 'Rosa', light: '#b72f64', dark: '#ff91b5' },
  { value: 'orange', label: 'Laranja', light: '#a34c00', dark: '#ffb467' },
] as const;

export type PostTextColor = (typeof POST_TEXT_COLORS)[number]['value'];

export function isPostTextColor(value: unknown): value is PostTextColor {
  return POST_TEXT_COLORS.some((color) => color.value === value);
}
