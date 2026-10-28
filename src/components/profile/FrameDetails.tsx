/** Small vector ornaments stay legible from comment avatars to full profiles. */
export function FrameDetails({ kind }: { kind: string }) {
  const point = (angle: number, radius = 53) => [
    60 + Math.cos(angle) * radius,
    60 + Math.sin(angle) * radius,
  ];
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: '-10%',
        width: '120%',
        height: '120%',
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      {kind === 'pixel' &&
        Array.from({ length: 32 }, (_, i) => {
          const [x, y] = point((i * Math.PI) / 16, 51);
          return (
            <rect
              key={i}
              x={Math.round(x / 4) * 4 - 3}
              y={Math.round(y / 4) * 4 - 3}
              width="6"
              height="6"
              fill={i % 4 === 0 ? '#ffedd5' : 'var(--frame-color)'}
            />
          );
        })}
      {kind === 'circuit' &&
        [0, 90, 180, 270].map((angle) => (
          <g
            key={angle}
            transform={`rotate(${angle} 60 60)`}
            stroke="var(--frame-color)"
            strokeWidth="1.8"
          >
            <path d="M24 25h12l8-8h13M18 33h13l8-8h14" />
            <circle cx="59" cy="17" r="2.5" fill="#cffafe" />
            <circle cx="55" cy="25" r="2" fill="#083344" />
          </g>
        ))}
      {kind === 'galaxy' &&
        [0, 1, 2, 3, 4, 5, 6].map((i) => {
          const [x, y] = point(i * 2.4, 51);
          return (
            <path
              key={i}
              d={`M${x} ${y - 4}q0 4 4 4q-4 0-4 4q0-4-4-4q4 0 4-4`}
              fill={i % 2 ? '#c4b5fd' : '#ffffff'}
            />
          );
        })}
      {kind === 'hacker' && (
        <g stroke="#86efac" strokeWidth="2" strokeLinecap="square">
          <path d="m20 37-7 7 7 7M100 69l7 7-7 7M25 99h8m4 0h4M82 18h12" />
          <path d="M49 8h3m4 0h3m4 0h3" stroke="#22c55e" />
        </g>
      )}
      {kind === 'halloween' && (
        <g fill="#28143f" stroke="#c084fc" strokeWidth="1">
          <path d="M6 25 4 12l12 6 5-8 5 8 12-6-2 13-9-3-6 8-6-8Z" />
          <path d="m82 94-2-12 12 5 5-8 5 8 12-5-2 12-9-2-6 8-6-8Z" />
          <path d="m19 19 2 2 2-2" stroke="#fb923c" />
        </g>
      )}
      {kind === 'christmas' &&
        [0, 120, 240].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 60 60)`}>
            <path
              d="M48 9q-12-9-19 1 10 11 19 3M52 9q12-9 19 1-10 11-19 3"
              fill="#15803d"
              stroke="#86efac"
              strokeWidth="1"
            />
            <circle cx="48" cy="12" r="3" fill="#ef4444" />
            <circle cx="54" cy="13" r="3" fill="#f87171" />
          </g>
        ))}
      {kind === 'legendary' && (
        <g stroke="#fcd34d" strokeWidth="1.5">
          <path
            d="m39 14-3-13 14 8L60-3 70 9l14-8-3 13-21 4Z"
            fill="#a16207"
            strokeLinejoin="round"
          />
          <path d="m60 3 4 6-4 5-4-5Z" fill="#fff7cc" />
          <path d="m57 109 3-5 3 5-3 6Z" fill="#fde68a" />
        </g>
      )}
    </svg>
  );
}
