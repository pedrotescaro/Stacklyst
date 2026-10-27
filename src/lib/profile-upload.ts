import { getSupabaseUrl } from '@/lib/supabase/env';

/** A profile image must come from this account's authenticated upload endpoint. */
export function isOwnedProfileUpload(value: unknown, userId: string): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const upload = new URL(value);
    const storage = new URL(getSupabaseUrl());
    const prefix = `/storage/v1/object/public/uploads/${encodeURIComponent(userId)}/`;
    return (
      upload.origin === storage.origin &&
      upload.protocol === 'https:' &&
      !upload.username &&
      !upload.password &&
      !upload.search &&
      !upload.hash &&
      upload.pathname.startsWith(prefix) &&
      /^[a-f\d-]{36}\.(?:jpg|png|gif|webp)$/.test(upload.pathname.slice(prefix.length))
    );
  } catch {
    return false;
  }
}
