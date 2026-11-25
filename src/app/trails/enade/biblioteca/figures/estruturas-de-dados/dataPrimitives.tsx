import { Text } from '../primitives';

export function Vertex({
  x,
  y,
  label,
  accent = false,
}: {
  x: number;
  y: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={20}
        fill="var(--enade-softer)"
        stroke={accent ? 'var(--color-dd-accent)' : 'var(--color-dd-muted)'}
        strokeWidth={1.5}
      />
      <Text x={x} y={y} weight={600}>
        {label}
      </Text>
    </g>
  );
}

export function Terminal({
  x,
  y,
  label,
  w = 80,
}: {
  x: number;
  y: number;
  label: string;
  w?: number;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={32}
        rx={16}
        fill="var(--enade-soft)"
        stroke="var(--color-dd-muted)"
        strokeWidth={1.5}
      />
      <Text x={x + w / 2} y={y + 16} weight={600}>
        {label}
      </Text>
    </g>
  );
}
