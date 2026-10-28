import type { CSSProperties, ReactNode } from 'react';
import {
  Award,
  Code2,
  Ghost,
  Heart,
  MessageCircle,
  Sprout,
  Users,
  Gift,
  Cake,
  Sparkles,
} from 'lucide-react';
import { getProfileFlags } from '@/lib/profile-customization';
import { readProfileIdentity, readableColor, type ProfileIdentityStyle } from '@/lib/profile-style';
import styles from './ProfileIdentity.module.css';

export function ProfileName({
  config,
  children,
  background,
  className = '',
}: {
  config?: unknown;
  children: ReactNode;
  background?: string | null;
  className?: string;
}) {
  const style = readProfileIdentity(config).nameStyle;
  const color = style?.color;
  const variables = {
    ...(color
      ? {
          '--name-light': readableColor(color, '#ffffff'),
          '--name-dark': readableColor(color, '#000000'),
          ...(background ? { color: readableColor(color, background) } : {}),
        }
      : {}),
    ...(style ? { fontWeight: style.bold ? 700 : 500 } : {}),
    ...(style?.italic ? { fontStyle: 'italic' } : {}),
    ...(style?.underline ? { textDecoration: 'underline', textUnderlineOffset: '.16em' } : {}),
  } as CSSProperties;
  return (
    <span className={`${styles.name} ${className}`} style={variables}>
      {children}
    </span>
  );
}

export function AvatarFrame({
  frame,
  children,
  className = '',
}: {
  frame?: ProfileIdentityStyle['frame'];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${frame ? styles.frame : ''} ${className}`}
      data-decoration={frame?.decoration}
      style={frame ? ({ '--frame-color': frame.color } as CSSProperties) : undefined}
    >
      {children}
      {frame?.decoration === 'alien' && (
        <svg className={styles.alienOverlay} viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <path
            d="M26 33 20 12M94 33l6-21"
            stroke="#79bd86"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="20" cy="10" r="5" fill="#79bd86" />
          <circle cx="100" cy="10" r="5" fill="#79bd86" />
          <path d="M31 98c7-18 51-18 58 0" stroke="var(--frame-color)" strokeWidth="3" />
          <ellipse
            cx="60"
            cy="103"
            rx="49"
            ry="10"
            fill="#253d42"
            stroke="var(--frame-color)"
            strokeWidth="2"
          />
          <ellipse cx="60" cy="100" rx="30" ry="5" fill="#607f85" />
          <circle cx="30" cy="104" r="3" fill="#f4cf74" />
          <circle cx="60" cy="106" r="3" fill="#f4cf74" />
          <circle cx="90" cy="104" r="3" fill="#f4cf74" />
        </svg>
      )}
      {frame?.decoration === 'hat' && (
        <svg className={styles.hatOverlay} viewBox="0 0 120 52" fill="none" aria-hidden="true">
          <path
            d="m34 38 7-30 19 7L78 7l8 31"
            fill="#343e52"
            stroke="var(--frame-color)"
            strokeWidth="2"
          />
          <path d="M37 29h46l3 10H34l3-10Z" fill="var(--frame-color)" />
          <path
            d="M18 39c17-7 68-7 85 0-6 10-78 10-85 0Z"
            fill="#343e52"
            stroke="var(--frame-color)"
            strokeWidth="2"
          />
        </svg>
      )}
    </div>
  );
}

export function ProfileFlag({ code }: { code: string | null | undefined }) {
  const flag = code ? getProfileFlags().find((flag) => flag.id === code) : null;
  // These SVGs are vetted local catalog assets, never user-supplied SVG uploads.
  return flag ? (
    <img
      className={styles.flag}
      src={flag.imageUrl}
      alt={`Bandeira: ${flag.label}`}
      width={24}
      height={18}
    />
  ) : null;
}

export function ProfileTitle({
  title,
  background,
}: {
  title?: ProfileIdentityStyle['title'];
  background?: string | null;
}) {
  if (!title) return null;
  const Icon =
    (
      {
        sprout: Sprout,
        code: Code2,
        ghost: Ghost,
        heart: Heart,
        message: MessageCircle,
        users: Users,
        gift: Gift,
        cake: Cake,
        sparkles: Sparkles,
      } as Record<string, typeof Award>
    )[title.icon || (title.id === 'posts-1' ? 'sprout' : 'award')] || Award;
  return (
    <span
      className={`${styles.title} ${styles.name}`}
      data-rarity={title.rarity}
      style={
        {
          '--name-light': readableColor(title.color, '#ffffff'),
          '--name-dark': readableColor(title.color, '#000000'),
          ...(background ? { color: readableColor(title.color, background) } : {}),
        } as CSSProperties
      }
    >
      <Icon size={13} aria-hidden="true" />
      {title.name}
    </span>
  );
}
