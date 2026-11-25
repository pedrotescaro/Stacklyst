import Image from 'next/image';
import { AvatarFrame } from '@/components/profile/ProfileIdentity';
import { readProfileIdentity } from '@/lib/profile-style';
import { isKlipyMediaUrl } from '@/lib/klipy';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface AuthorAvatarProps {
  username: string;
  avatar_url?: string | null;
  avatar_config?: unknown;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  decorative?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-10 h-10',
};

export function AuthorAvatar({
  username,
  avatar_url,
  avatar_config,
  size = 'sm',
  className = '',
  decorative = false,
}: AuthorAvatarProps) {
  const { text } = useLocalizedText();
  const initials = username.trim().slice(0, 2).toUpperCase() || 'DD';

  return (
    <AvatarFrame
      frame={readProfileIdentity(avatar_config).frame}
      className={`${sizeClasses[size]} shrink-0 ${className}`}
    >
      <div
        aria-hidden={decorative || undefined}
        className="flex h-full w-full select-none items-center justify-center overflow-hidden rounded-full border border-dd-border bg-blue-500/10 text-[10px] font-black text-blue-700 dark:text-blue-400"
      >
        {avatar_url ? (
          <Image
            src={avatar_url}
            alt={decorative ? '' : text(`Foto de ${username}`, `Photo of ${username}`)}
            width={48}
            height={48}
            unoptimized={isKlipyMediaUrl(avatar_url)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-label={
              decorative ? undefined : text(`Iniciais de ${username}`, `Initials of ${username}`)
            }
          >
            {initials}
          </span>
        )}
      </div>
    </AvatarFrame>
  );
}
