import { createHash, timingSafeEqual } from 'node:crypto';
import { credentialSnapshotSchema, type CredentialRecord, type CredentialSnapshot } from './types';

/** Stable object-key ordering; arrays retain their authored requirement order. */
export function canonicalCredentialJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalCredentialJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right, 'en'))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalCredentialJson(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function createCredentialHash(snapshot: CredentialSnapshot): string {
  return createHash('sha256')
    .update(canonicalCredentialJson(credentialSnapshotSchema.parse(snapshot)))
    .digest('hex');
}

export function verifyCredentialIntegrity(record: CredentialRecord): boolean {
  const { integrityHash, status: _status, ...snapshot } = record;
  const parsed = credentialSnapshotSchema.safeParse(snapshot);
  if (!parsed.success || !/^[a-f0-9]{64}$/.test(integrityHash)) return false;
  const actual = Buffer.from(createCredentialHash(parsed.data), 'hex');
  return timingSafeEqual(actual, Buffer.from(integrityHash, 'hex'));
}
