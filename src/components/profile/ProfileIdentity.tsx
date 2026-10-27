import type { CSSProperties, ReactNode } from 'react';
import { Award } from 'lucide-react';
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
      <Award size={13} aria-hidden="true" />
      {title.name}
    </span>
  );
}
