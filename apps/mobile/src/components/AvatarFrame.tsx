import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

const frameColors: Record<string, string> = {
  minimal: '#94a3b8',
  'neon-blue': '#38bdf8',
  'neon-purple': '#c084fc',
  cyberpunk: '#f472b6',
  circuit: '#22d3ee',
  pixel: '#facc15',
  galaxy: '#a78bfa',
  hacker: '#4ade80',
  halloween: '#fb923c',
  christmas: '#4ade80',
  legendary: '#fbbf24',
};

/** One size-independent frame keeps avatar photographs fully visible. */
export function AvatarFrame({
  children,
  frameId,
  size,
  color,
  decoration,
}: {
  children: ReactNode;
  frameId?: string | null;
  size: number;
  color?: string;
  decoration?: string;
}) {
  if (!frameId || frameId === 'none') return children;
  const stroke = color || frameColors[frameId] || '#38bdf8';
  const variant = decoration || frameId;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          inset: 0,
          padding: Math.max(3, size * 0.04),
          borderRadius: size / 2,
          borderWidth: Math.max(1, size * 0.025),
          borderColor: stroke,
        }}
      >
        {children}
      </View>
      <Svg
        pointerEvents="none"
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0 }}
      >
        <Circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke={stroke}
          strokeWidth={variant === 'minimal' ? 1 : 2}
          strokeDasharray={['circuit', 'hacker', 'pixel'].includes(variant) ? '8 5' : undefined}
        />
        {variant !== 'minimal' && (
          <Circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={variant === 'christmas' ? '#f87171' : stroke}
            strokeWidth=".6"
          />
        )}
        {['circuit', 'cyberpunk', 'hacker', 'galaxy', 'halloween', 'legendary'].includes(variant) &&
          [0, 60, 120, 180, 240, 300].map((angle) => (
            <Line
              key={angle}
              x1="50"
              y1="0"
              x2="50"
              y2="6"
              stroke={stroke}
              strokeWidth="3"
              transform={`rotate(${angle} 50 50)`}
            />
          ))}
        {variant === 'pixel' &&
          [0, 90, 180, 270].map((angle) => (
            <Rect
              key={angle}
              x="47"
              y="0"
              width="6"
              height="6"
              fill={stroke}
              transform={`rotate(${angle} 50 50)`}
            />
          ))}
      </Svg>
    </View>
  );
}
