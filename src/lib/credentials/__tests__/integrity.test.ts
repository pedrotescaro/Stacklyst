// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  canonicalCredentialJson,
  createCredentialHash,
  verifyCredentialIntegrity,
} from '../integrity';
import type { CredentialRecord, CredentialSnapshot } from '../types';

const snapshot: CredentialSnapshot = {
  id: '1497ccdc-515c-4de6-bc6f-002591ce9206',
  definition: {
    id: 'course:foundations-js',
    version: 1,
    title: 'JavaScript do zero',
    description: 'Conclusão dos requisitos avaliados.',
    language: 'JS',
    kind: 'course',
    estimatedMinutes: 90,
    skills: ['Variáveis'],
    requirements: [{ source: 'lesson', id: 'lesson-1', title: 'Primeiro programa' }],
  },
  recipientName: 'Pessoa & Nome',
  recipientUsername: 'person',
  issuedAt: '2026-11-01T18:00:00.000Z',
  verifiedAt: '2026-11-01T18:00:00.000Z',
};
describe('certificate snapshot integrity', () => {
  it('hashes canonical content independently of key insertion order', () => {
    expect(canonicalCredentialJson({ z: 1, a: { b: 2, a: 3 } })).toBe(
      canonicalCredentialJson({ a: { a: 3, b: 2 }, z: 1 })
    );
    expect(createCredentialHash(snapshot)).toMatch(/^[a-f0-9]{64}$/);
  });
  it('detects changes to the recipient, requirements, dates or hash, and rejects extra private fields', () => {
    const record: CredentialRecord = {
      ...snapshot,
      integrityHash: createCredentialHash(snapshot),
      status: 'valid',
    };
    expect(verifyCredentialIntegrity(record)).toBe(true);
    expect(verifyCredentialIntegrity({ ...record, recipientName: 'Another person' })).toBe(false);
    expect(
      verifyCredentialIntegrity({
        ...record,
        definition: { ...record.definition, requirements: [] },
      })
    ).toBe(false);
    expect(verifyCredentialIntegrity({ ...record, issuedAt: '2026-11-02T18:00:00.000Z' })).toBe(
      false
    );
    expect(verifyCredentialIntegrity({ ...record, integrityHash: 'bad' })).toBe(false);
    expect(
      verifyCredentialIntegrity({ ...record, email: 'private@example.invalid' } as CredentialRecord)
    ).toBe(false);
    // Revocation is a registry decision; it never rewrites the signed-off snapshot.
    expect(verifyCredentialIntegrity({ ...record, status: 'revoked' })).toBe(true);
  });
});
