/** Shared vector paths for the credential badge and the printed certificate seal. */
export const credentialBadgePaths = {
  shield: 'M120 12 L210 48 L210 126 C210 183 168 224 120 246 C72 224 30 183 30 126 L30 48 Z',
  shieldInset: 'M120 24 L198 56 L198 126 C198 174 164 211 120 233 C76 211 42 174 42 126 L42 56 Z',
  shieldField: 'M120 34 L188 62 L188 126 C188 166 159 202 120 222 C81 202 52 166 52 126 L52 62 Z',
  ribbon:
    'M18 170 L59 163 L59 197 L18 205 L29 187 Z M222 170 L181 163 L181 197 L222 205 L211 187 Z',
  ribbonFront: 'M48 157 Q120 168 192 157 L192 193 Q120 205 48 193 Z',
  ribbonFold: 'M48 193 L59 201 L59 195 Z M192 193 L181 201 L181 195 Z',
  leftStem: 'M91 153 C64 140 58 110 70 83',
  rightStem: 'M149 153 C176 140 182 110 170 83',
  leaf: 'M0 0 C-13 -2 -18 -11 -15 -17 C-6 -16 0 -10 0 0 Z',
  star: 'M0 -8 L2.4 -2.5 L8 -2.5 L3.8 1.4 L5.5 7 L0 3.7 L-5.5 7 L-3.8 1.4 L-8 -2.5 L-2.4 -2.5 Z',
  check: 'M109 139 L117 147 L133 129',
};

const palettes = {
  JS: { rim: '#bd8c25', edge: '#e5c979', field: '#17243b', accent: '#f1cf5b', ink: '#17243b' },
  TS: { rim: '#2366a8', edge: '#9bc7ee', field: '#122e51', accent: '#a7d5fa', ink: '#122e51' },
  PYTHON: { rim: '#b98927', edge: '#f0d67e', field: '#183552', accent: '#f6d560', ink: '#183552' },
  RUST: { rim: '#9d4f35', edge: '#edb18b', field: '#3d2625', accent: '#f0b387', ink: '#3d2625' },
  GO: { rim: '#1c8797', edge: '#9de1e9', field: '#133c48', accent: '#a8e5e8', ink: '#133c48' },
  JAVA: { rim: '#a74e41', edge: '#e8b6a4', field: '#18354c', accent: '#f3c2a4', ink: '#18354c' },
};

export function credentialBadgePalette(language: string | null) {
  return (
    palettes[language?.toUpperCase() as keyof typeof palettes] ?? {
      rim: '#286aaf',
      edge: '#b5d5ef',
      field: '#142e4d',
      accent: '#c3def4',
      ink: '#142e4d',
    }
  );
}

export function credentialBadgeLabel(language: string | null) {
  const labels: Record<string, string> = {
    JS: 'JS',
    TS: 'TS',
    PYTHON: 'PY',
    RUST: 'RS',
    GO: 'GO',
    JAVA: 'JAVA',
  };
  return labels[language?.toUpperCase() ?? ''] ?? '</>';
}

export function credentialBadgeRibbon(kind: string) {
  const labels: Record<string, string> = {
    first_lesson: 'PRIMEIRO PASSO',
    section: 'SEÇÃO CONCLUÍDA',
    course: 'CURSO CONCLUÍDO',
    practice: 'PRÁTICA CONCLUÍDA',
    path: 'TRILHA CONCLUÍDA',
  };
  return labels[kind] ?? 'CONQUISTA';
}

export const credentialLaurelLeaves = [
  { x: 76, y: 137, angle: 4 },
  { x: 69, y: 125, angle: 15 },
  { x: 66, y: 111, angle: 27 },
  { x: 68, y: 97, angle: 46 },
];
