/** Pixel frame and stepped fill stay independent of the authoritative health value. */
export function PixelMeter({
  value,
  label,
  compact = false,
  max = 100,
}: {
  value: number;
  label: string;
  compact?: boolean;
  max?: number;
}) {
  const maximum = Number.isFinite(max) && max > 0 ? max : 100;
  const health = Math.max(0, Math.min(maximum, value));
  const percentage = (health / maximum) * 100;
  return (
    <span
      className={`rpg-meter${compact ? ' rpg-meter-compact' : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={maximum}
      aria-valuenow={health}
      aria-valuetext={`${health} de ${maximum} pontos de vida`}
      data-health={percentage <= 25 ? 'low' : percentage <= 50 ? 'medium' : 'high'}
    >
      <span className="rpg-meter-track" aria-hidden="true">
        <span className="rpg-meter-fill" style={{ width: `${percentage}%` }} />
      </span>
    </span>
  );
}
