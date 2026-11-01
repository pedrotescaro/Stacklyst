import { useId } from 'react';
import {
  credentialBadgePaths as paths,
  credentialBadgePalette,
  credentialBadgeLabel,
  credentialBadgeRibbon,
  credentialLaurelLeaves,
} from '@/lib/credentials/badge-art';

export interface BadgeArtProps {
  language: string | null;
  kind: string;
  title?: string;
  size?: number;
  locked?: boolean;
}

export function BadgeArt({ language, kind, title, size = 112, locked = false }: BadgeArtProps) {
  const titleId = useId();
  const palette = locked
    ? { rim: '#64748b', edge: '#c1cad4', field: '#334155', accent: '#d6dde5', ink: '#334155' }
    : credentialBadgePalette(language);

  return (
    <svg
      viewBox="0 0 240 260"
      width={size}
      height={size * (260 / 240)}
      role="img"
      aria-labelledby={titleId}
      style={{ maxWidth: '100%', flexShrink: 0, opacity: locked ? 0.65 : 1 }}
    >
      <title id={titleId}>
        {`${title ?? `${credentialBadgeRibbon(kind)}${language ? ` · ${language}` : ''}`}${locked ? ', a conquistar' : ''}`}
      </title>
      <path d={paths.shield} fill={palette.rim} />
      <path d={paths.shieldInset} fill={palette.edge} />
      <path d={paths.shieldField} fill={palette.field} />
      <path
        d="M120 40 L180 66 L180 123 C180 157 156 189 120 211 C84 189 60 157 60 123 L60 66 Z"
        fill="none"
        stroke={palette.accent}
        strokeWidth="1"
        opacity="0.5"
      />
      <circle cx="120" cy="101" r="43" fill="none" stroke={palette.accent} strokeWidth="1" />
      <circle
        cx="120"
        cy="101"
        r="38"
        fill="none"
        stroke={palette.accent}
        strokeWidth="1"
        strokeDasharray="1 4"
      />
      <g fill={palette.accent}>
        <path d={paths.star} transform="translate(120 47) scale(.7)" />
        <path d={paths.star} transform="translate(89 54) scale(.4)" />
        <path d={paths.star} transform="translate(151 54) scale(.4)" />
      </g>
      <g fill="none" stroke={palette.accent} strokeWidth="1.6" strokeLinecap="round">
        <path d={paths.leftStem} />
        <path d={paths.rightStem} />
      </g>
      <g fill={palette.accent}>
        {credentialLaurelLeaves.map(({ x, y, angle }) => (
          <g key={`${x}-${y}`}>
            <path d={paths.leaf} transform={`translate(${x} ${y}) rotate(${angle})`} />
            <path
              d={paths.leaf}
              transform={`translate(${240 - x} ${y}) scale(-1 1) rotate(${angle})`}
            />
          </g>
        ))}
      </g>
      <text
        x="120"
        y="112"
        textAnchor="middle"
        fill={palette.accent}
        fontSize={language === 'JAVA' ? 25 : 31}
        fontWeight="750"
        fontFamily="var(--font-sora), sans-serif"
        letterSpacing="-1"
      >
        {credentialBadgeLabel(language)}
      </text>
      <circle
        cx="120"
        cy="139"
        r="17"
        fill={palette.field}
        stroke={palette.accent}
        strokeWidth="1"
      />
      {locked ? (
        <g fill="none" stroke={palette.accent} strokeWidth="2" strokeLinecap="round">
          <rect x="113" y="137" width="14" height="11" rx="2" />
          <path d="M116 137 V133 A4 4 0 0 1 124 133 V137" />
        </g>
      ) : (
        <path
          d={paths.check}
          fill="none"
          stroke={palette.accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <path d={paths.ribbon} fill={palette.rim} />
      <path d={paths.ribbonFold} fill={palette.field} />
      <path d={paths.ribbonFront} fill={palette.edge} />
      <path
        d="M53 162 Q120 173 187 162 M53 189 Q120 200 187 189"
        fill="none"
        stroke={palette.rim}
        strokeWidth="1"
      />
      <text
        x="120"
        y="182"
        textAnchor="middle"
        fill={palette.ink}
        fontSize="9"
        fontWeight="750"
        fontFamily="var(--font-sora), sans-serif"
        letterSpacing=".45"
      >
        {credentialBadgeRibbon(kind)}
      </text>
      <circle cx="120" cy="213" r="3" fill={palette.accent} />
    </svg>
  );
}
