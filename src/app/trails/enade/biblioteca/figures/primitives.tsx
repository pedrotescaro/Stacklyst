import { useId, type ReactNode, type SVGProps } from 'react';

type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
type Lines = string | string[];
type Box = { x: number; y: number; w: number; h: number };

const tones: Record<Tone, string> = {
  accent: 'var(--color-dd-accent)',
  success: 'var(--enade-success)',
  warning: 'var(--enade-warning)',
  danger: 'var(--enade-danger)',
  neutral: 'var(--color-dd-muted)',
};

function asLines(value: Lines) {
  return typeof value === 'string' ? [value] : value;
}

export function Diagram({
  title,
  desc,
  width = 480,
  height,
  children,
}: {
  title: string;
  desc: string;
  width?: number;
  height: number;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <svg
      role="img"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-desc`}
      viewBox={`0 0 ${width} ${height}`}
      fontFamily="inherit"
      strokeWidth={1.5}
    >
      <title id={`${id}-title`}>{title}</title>
      <desc id={`${id}-desc`}>{desc}</desc>
      {children}
    </svg>
  );
}

export function Text({
  x,
  y,
  children,
  muted = false,
  size = 14,
  align = 'middle',
  weight = 400,
  ...props
}: Omit<SVGProps<SVGTextElement>, 'x' | 'y'> & {
  x: number;
  y: number;
  muted?: boolean;
  size?: number;
  align?: 'start' | 'middle' | 'end';
  weight?: number;
}) {
  return (
    <text
      {...props}
      x={x}
      y={y}
      textAnchor={align}
      dominantBaseline="central"
      fontSize={size}
      fontWeight={weight}
      fill={muted ? 'var(--color-dd-muted)' : 'var(--color-dd-text)'}
    >
      {children}
    </text>
  );
}

function BoxText({ x, y, label, sub }: { x: number; y: number; label: Lines; sub?: Lines }) {
  const main = asLines(label);
  const secondary = sub ? asLines(sub) : [];
  const first = y - ((main.length + secondary.length - 1) * 17 + (sub ? 4 : 0)) / 2;
  return (
    <g>
      {main.map((line, index) => (
        <Text key={index} x={x} y={first + index * 17} weight={600}>
          {line}
        </Text>
      ))}
      {secondary.map((line, index) => (
        <Text key={index} x={x} y={first + (main.length + index) * 17 + 4} size={13} muted>
          {line}
        </Text>
      ))}
    </g>
  );
}

export function Node({
  x,
  y,
  w,
  h,
  label,
  sub,
  tone = 'neutral',
}: Box & {
  label: Lines;
  sub?: Lines;
  tone?: Tone;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill="var(--enade-softer)"
        stroke={tone === 'neutral' ? 'var(--enade-line)' : tones[tone]}
      />
      <BoxText x={x + w / 2} y={y + h / 2} label={label} sub={sub} />
    </g>
  );
}

type MarkerKind = 'solid' | 'open' | 'triangle' | 'diamond' | 'diamond-filled';

function ArrowMarker({ id, kind, color }: { id: string; kind: MarkerKind; color: string }) {
  const open = kind === 'open';
  const triangle = kind === 'triangle';
  const diamond = kind === 'diamond' || kind === 'diamond-filled';
  return (
    <marker
      id={id}
      viewBox="0 0 13 10"
      refX={diamond ? 12 : 11.5}
      refY={5}
      markerWidth={diamond || triangle ? 13 : 9}
      markerHeight={diamond || triangle ? 10 : 7}
      markerUnits="userSpaceOnUse"
      orient="auto-start-reverse"
    >
      <path
        d={diamond ? 'M1 5 6.5 1 12 5 6.5 9Z' : `M2 1 11.5 5 2 9${open ? '' : 'Z'}`}
        fill={open ? 'none' : triangle || kind === 'diamond' ? 'var(--enade-softer)' : color}
        stroke={color}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </marker>
  );
}

export function Arrow({
  d,
  x1,
  y1,
  x2,
  y2,
  kind = 'solid',
  start = 'none',
  dashed = false,
  tone = 'accent',
}: {
  d?: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  kind?: MarkerKind | 'none';
  start?: MarkerKind | 'none';
  dashed?: boolean;
  tone?: Tone;
}) {
  const id = useId();
  const color = tones[tone];
  return (
    <g>
      {(kind !== 'none' || start !== 'none') && (
        <defs>
          {kind !== 'none' && <ArrowMarker id={`${id}-end`} kind={kind} color={color} />}
          {start !== 'none' && <ArrowMarker id={`${id}-start`} kind={start} color={color} />}
        </defs>
      )}
      <path
        d={d ?? `M${x1} ${y1} ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeDasharray={dashed ? '5 4' : undefined}
        strokeLinejoin="round"
        markerEnd={kind !== 'none' ? `url(#${id}-end)` : undefined}
        markerStart={start !== 'none' ? `url(#${id}-start)` : undefined}
      />
    </g>
  );
}

export function Phase(props: Box & { label: Lines; sub?: Lines }) {
  return <Node {...props} tone="accent" />;
}

export function Swimlane({
  x,
  y,
  w,
  h,
  label,
  children,
}: Box & { label: string; children?: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke="var(--enade-line)" />
      <path d={`M${x} ${y + 32}h${w}`} stroke="var(--enade-line)" />
      <Text x={x + 12} y={y + 16} align="start" weight={600}>
        {label}
      </Text>
      {children}
    </g>
  );
}

export function Note({ x, y, w, h, label, sub }: Box & { label: Lines; sub?: Lines }) {
  return (
    <g>
      <path
        d={`M${x} ${y}h${w - 12}l12 12v${h - 12}h${-w}Z M${x + w - 12} ${y}v12h12`}
        fill="var(--enade-soft)"
        stroke="var(--enade-line)"
      />
      <BoxText x={x + w / 2} y={y + h / 2} label={label} sub={sub} />
    </g>
  );
}

export function Diamond({
  x,
  y,
  w,
  h,
  label,
  tone = 'neutral',
}: Box & { label?: Lines; tone?: Tone }) {
  return (
    <g>
      <path
        d={`M${x + w / 2} ${y} ${x + w} ${y + h / 2} ${x + w / 2} ${y + h} ${x} ${y + h / 2}Z`}
        fill="var(--enade-softer)"
        stroke={tones[tone]}
      />
      {label && <BoxText x={x + w / 2} y={y + h / 2} label={label} />}
    </g>
  );
}

export function UmlClass({
  x,
  y,
  w,
  name,
  attributes = [],
  operations = [],
  stereotype,
  abstract = false,
}: Omit<Box, 'h'> & {
  name: string;
  attributes?: string[];
  operations?: string[];
  stereotype?: string;
  abstract?: boolean;
}) {
  const heading = stereotype ? 48 : 32;
  const attributesHeight = attributes.length ? attributes.length * 18 + 12 : 0;
  const operationsHeight = operations.length ? operations.length * 18 + 12 : 0;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={heading + attributesHeight + operationsHeight}
        fill="var(--enade-softer)"
        stroke="var(--color-dd-muted)"
      />
      {stereotype && (
        <Text x={x + w / 2} y={y + 13} size={13} muted>
          «{stereotype}»
        </Text>
      )}
      <Text
        x={x + w / 2}
        y={y + heading - 16}
        weight={600}
        fontStyle={abstract ? 'italic' : undefined}
      >
        {name}
      </Text>
      {[attributes, operations].map((lines, index) => {
        if (!lines.length) return null;
        const top = y + heading + (index ? attributesHeight : 0);
        return (
          <g key={index}>
            <path d={`M${x} ${top}h${w}`} stroke="var(--enade-line)" />
            {lines.map((line, row) => (
              <Text key={row} x={x + 8} y={top + 15 + row * 18} align="start" size={13}>
                {line}
              </Text>
            ))}
          </g>
        );
      })}
    </g>
  );
}

export function Actor({ x, y, label }: { x: number; y: number; label: Lines }) {
  return (
    <g>
      <circle cx={x} cy={y + 8} r={7} fill="none" stroke="var(--color-dd-text)" />
      <path
        d={`M${x} ${y + 15}v22m-13-14h26m-13 14-11 15m11-15 11 15`}
        fill="none"
        stroke="var(--color-dd-text)"
      />
      {asLines(label).map((line, index) => (
        <Text key={index} x={x} y={y + 65 + index * 16} size={13}>
          {line}
        </Text>
      ))}
    </g>
  );
}

export function UseCase({ x, y, w, h, label }: Box & { label: Lines }) {
  return (
    <g>
      <ellipse
        cx={x + w / 2}
        cy={y + h / 2}
        rx={w / 2}
        ry={h / 2}
        fill="var(--enade-softer)"
        stroke="var(--color-dd-muted)"
      />
      <BoxText x={x + w / 2} y={y + h / 2} label={label} />
    </g>
  );
}

export function Lifeline({ x, y, w, h, label }: Box & { label: Lines }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={36}
        fill="var(--enade-softer)"
        stroke="var(--color-dd-muted)"
      />
      <BoxText x={x + w / 2} y={y + 18} label={label} />
      <path
        d={`M${x + w / 2} ${y + 36}V${y + h}`}
        stroke="var(--color-dd-muted)"
        strokeDasharray="5 4"
      />
    </g>
  );
}

export function Activation({ x, y, h, w = 10 }: Omit<Box, 'w'> & { w?: number }) {
  return (
    <rect
      x={x - w / 2}
      y={y}
      width={w}
      height={h}
      fill="var(--enade-soft)"
      stroke="var(--color-dd-muted)"
    />
  );
}
