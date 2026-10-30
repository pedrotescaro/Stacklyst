/** Pixel frame and stepped fill stay independent of the authoritative health value. */
export function PixelMeter({
  value,
  label,
  compact = false,
}: {
  value: number;
  label: string;
  compact?: boolean;
}) {
  const health = Math.max(0, Math.min(100, value));
  return (
    <span
      className={`rpg-meter${compact ? ' rpg-meter-compact' : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={health}
      aria-valuetext={`${health} de 100 pontos de vida`}
      data-health={health <= 25 ? 'low' : health <= 50 ? 'medium' : 'high'}
    >
      <span className="rpg-meter-track" aria-hidden="true">
        <span className="rpg-meter-fill" style={{ width: `${health}%` }} />
      </span>
    </span>
  );
}
