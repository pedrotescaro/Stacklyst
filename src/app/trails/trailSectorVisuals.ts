const REFERENCE_SECTOR_ACCENTS = [
  '#c866ff',
  '#84cc16',
  '#0ea5e9',
  '#facc15',
  '#14b8a6',
  '#f97316',
] as const;

const CARDINAL_SECTOR_LABELS = ['Setor Oeste', 'Setor Norte', 'Setor Leste', 'Setor Sul'] as const;
const CARDINAL_SECTOR_LABELS_EN = [
  'West Sector',
  'North Sector',
  'East Sector',
  'South Sector',
] as const;

export function getTrailSectorAccent(index: number, total: number, fallback?: string | null) {
  if (total >= 4) {
    return REFERENCE_SECTOR_ACCENTS[index % REFERENCE_SECTOR_ACCENTS.length]!;
  }

  return fallback || REFERENCE_SECTOR_ACCENTS[index % REFERENCE_SECTOR_ACCENTS.length]!;
}

export function getTrailSectorRegionLabel(index: number, total: number, isEnglish = false) {
  if (total === CARDINAL_SECTOR_LABELS.length) {
    return isEnglish ? CARDINAL_SECTOR_LABELS_EN[index]! : CARDINAL_SECTOR_LABELS[index]!;
  }
  return isEnglish
    ? `Sector ${String(index + 1).padStart(2, '0')}`
    : `Setor ${String(index + 1).padStart(2, '0')}`;
}
