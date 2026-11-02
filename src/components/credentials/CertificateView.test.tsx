import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CertificateView } from './CertificateView';
import { createCredentialHash } from '@/lib/credentials/integrity';
import type { CredentialRecord, CredentialSnapshot } from '@/lib/credentials/types';

const snapshot: CredentialSnapshot = {
  id: '7633bb15-4d34-4af3-b5d8-40efaf57ce31',
  recipientName: 'Ana Maria da Silva',
  recipientUsername: 'ana.silva',
  issuedAt: '2026-11-01T12:00:00.000Z',
  verifiedAt: '2026-11-01T12:00:00.000Z',
  definition: {
    id: 'course:ts',
    version: 1,
    title: 'TypeScript do zero',
    description: 'Conclusão das atividades avaliadas de TypeScript.',
    kind: 'course',
    language: 'TS',
    estimatedMinutes: 90,
    skills: ['Tipos'],
    requirements: [{ id: 'lesson-ts', source: 'lesson', title: 'Tipos e valores' }],
  },
};
const record: CredentialRecord = {
  ...snapshot,
  integrityHash: createCredentialHash(snapshot),
  status: 'valid',
};

afterEach(cleanup);

describe('CertificateView', () => {
  it('keeps the original certificate content and actions while displaying the language logo', () => {
    const { container } = render(<CertificateView record={record} />);

    expect(screen.getByText('Certificado verificado')).toBeInTheDocument();
    const document = within(screen.getByRole('article'));
    expect(document.getByText(record.recipientName)).toBeInTheDocument();
    expect(
      document.getByRole('heading', { level: 1, name: record.definition.title })
    ).toBeInTheDocument();
    expect(container.querySelector('[data-credential-logo="TS"]')).toBeInTheDocument();
    expect(container.querySelector('[data-credential-status="earned"]')).toBeInTheDocument();
    expect(document.getByText('90 minutos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver perfil' })).toHaveAttribute(
      'href',
      '/profile/ana.silva?tab=badges'
    );
    expect(screen.getByRole('link', { name: 'Baixar certificado em PDF' })).toHaveAttribute(
      'href',
      `/api/certificates/${record.id}/pdf`
    );
    expect(screen.getByText('Tipos e valores')).toBeInTheDocument();
    expect(screen.getByText(record.integrityHash)).toBeInTheDocument();
  });

  it.each([
    ['revoked', { ...record, status: 'revoked' as const }],
    ['corrupted', { ...record, recipientName: 'Nome alterado' }],
  ])('withholds download and verified status for a %s record', (_state, invalid) => {
    const { container } = render(<CertificateView record={invalid} />);

    expect(screen.getByText('Certificado indisponível para validação')).toBeInTheDocument();
    expect(container.querySelector('[data-credential-status="locked"]')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Baixar certificado em PDF' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Certificado verificado')).not.toBeInTheDocument();
    expect(screen.getByText(invalid.integrityHash)).toBeInTheDocument();
  });
});
