import React, { useId } from 'react';

interface LeaderboardMedalProps {
  rank: 1 | 2 | 3 | number;
  className?: string;
  size?: number;
}

export function LeaderboardMedal({
  rank,
  className = 'h-9 w-9',
  size = 36,
}: LeaderboardMedalProps) {
  const rawId = useId();
  // Safe ID for SVG defs
  const id = rawId.replace(/[^a-zA-Z0-9-_]/g, '');

  if (rank === 1) {
    // 🥇 GOLD MEDAL
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 drop-shadow-[0_2px_8px_rgba(245,158,11,0.35)] ${className}`}
        aria-label="1º Lugar - Medalha de Ouro"
        role="img"
      >
        <defs>
          <linearGradient
            id={`gold-ribbon-left-${id}`}
            x1="10"
            y1="2"
            x2="16"
            y2="13"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient
            id={`gold-ribbon-right-${id}`}
            x1="26"
            y1="2"
            x2="20"
            y2="13"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient
            id={`gold-rim-${id}`}
            x1="18"
            y1="10"
            x2="18"
            y2="34"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <radialGradient id={`gold-face-${id}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="45%" stopColor="#FBBF24" />
            <stop offset="85%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
        </defs>

        {/* Fita Esquerda */}
        <polygon points="10,2 15,2 17.5,13 12.5,13" fill={`url(#gold-ribbon-left-${id})`} />
        <polygon points="12,2 13.5,2 15.5,13 14,13" fill="#60A5FA" opacity="0.8" />

        {/* Fita Direita */}
        <polygon points="26,2 21,2 18.5,13 23.5,13" fill={`url(#gold-ribbon-right-${id})`} />
        <polygon points="24,2 22.5,2 20.5,13 22,13" fill="#93C5FD" opacity="0.8" />

        {/* Fivela da Fita */}
        <rect
          x="13.5"
          y="10.5"
          width="9"
          height="3"
          rx="1.5"
          fill="#F59E0B"
          stroke="#B45309"
          strokeWidth="0.6"
        />

        {/* Sombra 3D Inferior da Medalha */}
        <circle cx="18" cy="23.8" r="11" fill="#78350F" />

        {/* Borda Externa Metálica Dourada */}
        <circle cx="18" cy="22" r="11" fill={`url(#gold-rim-${id})`} />

        {/* Disco Interno Dourado */}
        <circle
          cx="18"
          cy="22"
          r="9.2"
          fill={`url(#gold-face-${id})`}
          stroke="#FDE68A"
          strokeWidth="0.8"
        />

        {/* Brilho Especular (Gloss Arc) */}
        <path
          d="M 11.2 20.5 A 7.5 7.5 0 0 1 23 15.5 A 8.5 8.5 0 0 0 12.5 22.5 Z"
          fill="#FFFFFF"
          opacity="0.45"
        />

        {/* Estrelinha decorativa no topo */}
        <path
          d="M 18 14 L 18.6 15.2 L 20 15.3 L 18.9 16.2 L 19.3 17.5 L 18 16.7 L 16.7 17.5 L 17.1 16.2 L 16 15.3 L 17.4 15.2 Z"
          fill="#FFFBEB"
        />

        {/* Número com efeito 3D em relevo */}
        <text
          aria-hidden="true"
          x="18"
          y="27.8"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#78350F"
        >
          1
        </text>
        <text
          x="18"
          y="26.8"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFBEB"
        >
          1
        </text>
      </svg>
    );
  }

  if (rank === 2) {
    // 🥈 SILVER MEDAL
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 drop-shadow-[0_2px_8px_rgba(148,163,184,0.3)] ${className}`}
        aria-label="2º Lugar - Medalha de Prata"
        role="img"
      >
        <defs>
          <linearGradient
            id={`silver-ribbon-left-${id}`}
            x1="10"
            y1="2"
            x2="16"
            y2="13"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient
            id={`silver-ribbon-right-${id}`}
            x1="26"
            y1="2"
            x2="20"
            y2="13"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient
            id={`silver-rim-${id}`}
            x1="18"
            y1="10"
            x2="18"
            y2="34"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <radialGradient id={`silver-face-${id}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F1F5F9" />
            <stop offset="85%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </radialGradient>
        </defs>

        {/* Fita Esquerda */}
        <polygon points="10,2 15,2 17.5,13 12.5,13" fill={`url(#silver-ribbon-left-${id})`} />
        <polygon points="12,2 13.5,2 15.5,13 14,13" fill="#7DD3FC" opacity="0.8" />

        {/* Fita Direita */}
        <polygon points="26,2 21,2 18.5,13 23.5,13" fill={`url(#silver-ribbon-right-${id})`} />
        <polygon points="24,2 22.5,2 20.5,13 22,13" fill="#BAE6FD" opacity="0.8" />

        {/* Fivela da Fita */}
        <rect
          x="13.5"
          y="10.5"
          width="9"
          height="3"
          rx="1.5"
          fill="#94A3B8"
          stroke="#475569"
          strokeWidth="0.6"
        />

        {/* Sombra 3D Inferior da Medalha */}
        <circle cx="18" cy="23.8" r="11" fill="#334155" />

        {/* Borda Externa Metálica Prateada */}
        <circle cx="18" cy="22" r="11" fill={`url(#silver-rim-${id})`} />

        {/* Disco Interno Prateado */}
        <circle
          cx="18"
          cy="22"
          r="9.2"
          fill={`url(#silver-face-${id})`}
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />

        {/* Brilho Especular (Gloss Arc) */}
        <path
          d="M 11.2 20.5 A 7.5 7.5 0 0 1 23 15.5 A 8.5 8.5 0 0 0 12.5 22.5 Z"
          fill="#FFFFFF"
          opacity="0.5"
        />

        {/* Estrelinha decorativa no topo */}
        <path
          d="M 18 14 L 18.6 15.2 L 20 15.3 L 18.9 16.2 L 19.3 17.5 L 18 16.7 L 16.7 17.5 L 17.1 16.2 L 16 15.3 L 17.4 15.2 Z"
          fill="#FFFFFF"
        />

        {/* Número 2 com efeito 3D em relevo */}
        <text
          aria-hidden="true"
          x="18"
          y="27.8"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#334155"
        >
          2
        </text>
        <text
          x="18"
          y="26.8"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
        >
          2
        </text>
      </svg>
    );
  }

  // 🥉 BRONZE MEDAL (rank === 3 or fallback)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_2px_8px_rgba(234,88,12,0.35)] ${className}`}
      aria-label="3º Lugar - Medalha de Bronze"
      role="img"
    >
      <defs>
        <linearGradient
          id={`bronze-ribbon-left-${id}`}
          x1="10"
          y1="2"
          x2="16"
          y2="13"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient
          id={`bronze-ribbon-right-${id}`}
          x1="26"
          y1="2"
          x2="20"
          y2="13"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient
          id={`bronze-rim-${id}`}
          x1="18"
          y1="10"
          x2="18"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="40%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
        <radialGradient id={`bronze-face-${id}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFEDD5" />
          <stop offset="45%" stopColor="#FB923C" />
          <stop offset="85%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </radialGradient>
      </defs>

      {/* Fita Esquerda */}
      <polygon points="10,2 15,2 17.5,13 12.5,13" fill={`url(#bronze-ribbon-left-${id})`} />
      <polygon points="12,2 13.5,2 15.5,13 14,13" fill="#A5B4FC" opacity="0.8" />

      {/* Fita Direita */}
      <polygon points="26,2 21,2 18.5,13 23.5,13" fill={`url(#bronze-ribbon-right-${id})`} />
      <polygon points="24,2 22.5,2 20.5,13 22,13" fill="#C7D2FE" opacity="0.8" />

      {/* Fivela da Fita */}
      <rect
        x="13.5"
        y="10.5"
        width="9"
        height="3"
        rx="1.5"
        fill="#EA580C"
        stroke="#9A3412"
        strokeWidth="0.6"
      />

      {/* Sombra 3D Inferior da Medalha */}
      <circle cx="18" cy="23.8" r="11" fill="#431407" />

      {/* Borda Externa Metálica Bronze */}
      <circle cx="18" cy="22" r="11" fill={`url(#bronze-rim-${id})`} />

      {/* Disco Interno Bronze */}
      <circle
        cx="18"
        cy="22"
        r="9.2"
        fill={`url(#bronze-face-${id})`}
        stroke="#FED7AA"
        strokeWidth="0.8"
      />

      {/* Brilho Especular (Gloss Arc) */}
      <path
        d="M 11.2 20.5 A 7.5 7.5 0 0 1 23 15.5 A 8.5 8.5 0 0 0 12.5 22.5 Z"
        fill="#FFFFFF"
        opacity="0.45"
      />

      {/* Estrelinha decorativa no topo */}
      <path
        d="M 18 14 L 18.6 15.2 L 20 15.3 L 18.9 16.2 L 19.3 17.5 L 18 16.7 L 16.7 17.5 L 17.1 16.2 L 16 15.3 L 17.4 15.2 Z"
        fill="#FFF7ED"
      />

      {/* Número 3 com efeito 3D em relevo */}
      <text
        aria-hidden="true"
        x="18"
        y="27.8"
        textAnchor="middle"
        fontSize="10"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        fill="#431407"
      >
        3
      </text>
      <text
        x="18"
        y="26.8"
        textAnchor="middle"
        fontSize="10"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        fill="#FFF7ED"
      >
        3
      </text>
    </svg>
  );
}
