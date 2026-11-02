import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { CredentialCollection, CredentialRecord } from '@/lib/credentials/types';
import { ProfileCertificates } from './ProfileCertificates';

const record: CredentialRecord = {
  id: '7633bb15-4d34-4af3-b5d8-40efaf57ce31',
  definition: {
    id: 'course:ts',
    version: 1,
    title: 'TypeScript do zero',
    description: 'Conclua todas as lições do curso.',
    kind: 'course',
    language: 'TS',
    estimatedMinutes: 90,
    skills: ['Tipos'],
    requirements: [{ id: 'lesson-ts', source: 'lesson', title: 'Tipos e valores' }],
  },
  recipientName: 'Ana',
  recipientUsername: 'ana',
  issuedAt: '2026-11-01T12:00:00.000Z',
  verifiedAt: '2026-11-01T12:00:00.000Z',
  integrityHash: 'a'.repeat(64),
  status: 'valid',
};
const collection: CredentialCollection = {
  earnedCount: 1,
  items: [{ definition: record.definition, completed: 1, total: 1, credential: record }],
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('loads the owner collection with its existing search, criteria and PDF actions', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => collection });
  vi.stubGlobal('fetch', fetchMock);
  render(<ProfileCertificates isOwner credentials={[]} />);
  expect(screen.getByRole('status')).toHaveTextContent('Carregando certificados');
  expect(await screen.findByRole('heading', { name: 'TypeScript do zero' })).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith('/api/certificates', {
    signal: expect.any(AbortSignal),
    cache: 'no-store',
  });
  expect(screen.getByRole('textbox', { name: 'Buscar certificados' })).toBeInTheDocument();
  expect(screen.getByText('Como conquistar', { exact: false })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Baixar PDF' })).toHaveAttribute(
    'href',
    `/api/certificates/${record.id}/pdf`
  );
});

it('shows visitor records without requesting or exposing the signed-in user collection', () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  render(
    <ProfileCertificates
      isOwner={false}
      credentials={[record, { ...record, id: 'revoked', status: 'revoked' }]}
    />
  );
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getAllByRole('heading', { name: 'TypeScript do zero' })).toHaveLength(1);
  expect(
    screen.getByText('Atividades concluídas', { exact: false, selector: 'summary' })
  ).toBeInTheDocument();
  expect(screen.queryByText('Cada badge conta uma conquista sua.', { exact: false })).toBeNull();
  expect(screen.getByRole('link', { name: 'Ver certificado' })).toHaveAttribute(
    'href',
    `/certificates/${record.id}`
  );
});

it('explains when another profile has no earned records', () => {
  vi.stubGlobal('fetch', vi.fn());
  render(<ProfileCertificates isOwner={false} credentials={[]} />);
  expect(
    screen.getByRole('heading', { name: 'Este perfil ainda não possui certificados' })
  ).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Ver todas' })).not.toBeInTheDocument();
});

it('supports retry after a failed collection request', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Falha temporária.' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => collection });
  vi.stubGlobal('fetch', fetchMock);
  render(<ProfileCertificates isOwner credentials={[]} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Falha temporária.');
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(await screen.findByRole('heading', { name: 'TypeScript do zero' })).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it('aborts the owner request when switching to a visitor profile', async () => {
  let signal: AbortSignal | undefined;
  const fetchMock = vi.fn((_url: string, options: RequestInit) => {
    signal = options.signal as AbortSignal;
    return new Promise(() => {});
  });
  vi.stubGlobal('fetch', fetchMock);
  const { rerender } = render(<ProfileCertificates isOwner credentials={[]} />);
  await waitFor(() => expect(signal).toBeDefined());
  rerender(<ProfileCertificates isOwner={false} credentials={[]} />);
  expect(signal?.aborted).toBe(true);
  expect(
    screen.getByRole('heading', { name: 'Este perfil ainda não possui certificados' })
  ).toBeInTheDocument();
});
