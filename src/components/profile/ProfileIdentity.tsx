import type { CSSProperties, ReactNode } from 'react';
import { FrameDetails } from './FrameDetails';
import { getFrameRingBackground } from '@/lib/profile-frames';
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

type IdentityBackgrounds = { light: string; dark: string };

export function ProfileName({
  config,
  children,
  background,
  backgrounds,
  className = '',
}: {
  config?: unknown;
  children: ReactNode;
  background?: string | null;
  backgrounds?: IdentityBackgrounds;
  className?: string;
}) {
  const style = readProfileIdentity(config).nameStyle;
  const color = style?.color;
  const variables = {
    ...(color
      ? {
          '--name-light': readableColor(color, backgrounds?.light ?? '#ffffff'),
          '--name-dark': readableColor(color, backgrounds?.dark ?? '#000000'),
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
      style={
        frame
          ? ({
              '--frame-color': frame.color,
              '--frame-background': getFrameRingBackground(frame.id),
            } as CSSProperties)
          : undefined
      }
    >
      {frame?.decoration === 'alien' && (
        <svg
          className={`${styles.alienOverlay} ${styles.alienRear}`}
          viewBox="0 0 120 120"
          fill="none"
          aria-hidden="true"
        >
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
        </svg>
      )}
      {children}
      {frame &&
        ['pixel', 'circuit', 'galaxy', 'hacker', 'halloween', 'christmas', 'legendary'].includes(
          frame.decoration
        ) && <FrameDetails kind={frame.decoration} />}
      {frame?.decoration === 'propeller' && (
        <svg className={styles.propellerHat} viewBox="0 0 120 65" fill="none" aria-hidden="true">
          <path
            d="M20 57c0-26 17-40 40-40s40 14 40 40"
            fill="#facc15"
            stroke="#172554"
            strokeWidth="2"
          />
          <path d="M20 57c0-23 16-40 40-40-12 12-16 24-16 40" fill="#22c55e" />
          <path d="M60 17c24 0 40 17 40 40H76c0-16-4-28-16-40Z" fill="#ef4444" />
          <path
            d="M60 18c-12 12-16 24-16 36M60 18c12 12 16 24 16 36"
            stroke="#ffffff"
            strokeOpacity=".4"
            strokeWidth="1.5"
          />
          <path
            d="M26 48c9-7 22-10 34-10s25 3 34 10"
            stroke="#172554"
            strokeOpacity=".15"
            strokeWidth="7"
          />
          <path
            d="M17 55h85l12 6H12l5-6Z"
            fill="#0083fe"
            stroke="#172554"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M60 18V9" stroke="#172554" strokeWidth="3" />
          <g className={styles.propellerBlades}>
            <ellipse cx="45" cy="8" rx="17" ry="4" fill="#ef4444" />
            <ellipse cx="75" cy="8" rx="17" ry="4" fill="#22c55e" />
            <circle cx="60" cy="8" r="4" fill="#facc15" />
          </g>
        </svg>
      )}
      {frame?.decoration === 'laurel' && (
        <svg className={styles.laurelOverlay} viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <path
            d="M48 112C5 99-2 48 22 17M72 112c43-13 50-64 26-95"
            stroke="var(--frame-color)"
            strokeWidth="2"
          />
          {[30, 48, 66, 84, 100].map((y, i) => (
            <g key={y} fill="var(--frame-color)">
              <ellipse
                cx={i === 4 ? 31 : 13}
                cy={y}
                rx="4"
                ry="9"
                transform={`rotate(-35 ${i === 4 ? 31 : 13} ${y})`}
              />
              <ellipse
                cx={i === 4 ? 89 : 107}
                cy={y}
                rx="4"
                ry="9"
                transform={`rotate(35 ${i === 4 ? 89 : 107} ${y})`}
              />
            </g>
          ))}
        </svg>
      )}
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
          <path
            d="M11 103a49 10 0 0 0 98 0"
            fill="#253d42"
            stroke="var(--frame-color)"
            strokeWidth="2"
          />
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
  backgrounds,
}: {
  title?: ProfileIdentityStyle['title'];
  background?: string | null;
  backgrounds?: IdentityBackgrounds;
}) {
  if (!title) return null;
  const isBeginner = title.id === 'posts-1' || title.name.trim().toLowerCase() === 'iniciante';
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
          '--name-light': readableColor(title.color, backgrounds?.light ?? '#ffffff'),
          '--name-dark': readableColor(title.color, backgrounds?.dark ?? '#000000'),
          ...(background ? { color: readableColor(title.color, background) } : {}),
        } as CSSProperties
      }
    >
      {!isBeginner && <Icon size={13} aria-hidden="true" />}
      {title.name}
    </span>
  );
}
