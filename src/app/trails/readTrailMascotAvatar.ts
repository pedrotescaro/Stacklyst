import { DEFAULT_AVATAR, type Avatar } from '@/lib/mundinho/types';

/** Saved avatars may predate newer fields, so missing ones fall back to the defaults. */
export function readTrailMascotAvatar(saved: unknown): Avatar {
  return saved && typeof saved === 'object' && !Array.isArray(saved)
    ? { ...DEFAULT_AVATAR, ...(saved as Partial<Avatar>) }
    : DEFAULT_AVATAR;
}
