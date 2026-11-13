'use client';

import { ProfileFlag, ProfileName, ProfileTitle } from '@/components/profile/ProfileIdentity';
import { getAuthorDisplayName, readProfileIdentity } from '@/lib/profile-style';
import { cn } from '@/lib/cn';

interface DmPerson {
  username: string;
  name?: string | null;
  avatar_config?: unknown;
}

/** A DM partner's styled name and flags (and title, when there is room), like on posts. */
export function DmName({
  person,
  showTitle = false,
  className,
}: {
  person: DmPerson;
  showTitle?: boolean;
  className?: string;
}) {
  const identity = readProfileIdentity(person.avatar_config);
  return (
    <span className={cn('flex min-w-0 items-center gap-1.5', className)}>
      <span className="truncate font-extrabold text-dd-text">
        <ProfileName config={person.avatar_config}>{getAuthorDisplayName(person)}</ProfileName>
      </span>
      {identity.flags?.length ? (
        <span className="inline-flex shrink-0 items-center gap-1">
          {identity.flags.map((code) => (
            <ProfileFlag key={code} code={code} />
          ))}
        </span>
      ) : null}
      {showTitle && identity.title && <ProfileTitle title={identity.title} />}
    </span>
  );
}
