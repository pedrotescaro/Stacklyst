import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { CredentialCollection } from './CredentialCollection';
import type {
  CredentialCollection as Collection,
  CredentialDefinition,
  CredentialRecord,
} from '@/lib/credentials/types';

const definition: CredentialDefinition = {
  id: 'course:ts',
  version: 1,
  title: 'TypeScript do zero',
  description: 'Conclua todas as lições do curso.',
  kind: 'course',
  language: 'TS',
  estimatedMinutes: 90,
  skills: ['Tipos'],
  requirements: [{ id: 'lesson-ts', source: 'lesson', title: 'Tipos e valores' }],
};
const record: CredentialRecord = {
  id: '7633bb15-4d34-4af3-b5d8-40efaf57ce31',
  definition,
  recipientName: 'Ana',
  recipientUsername: 'ana',
  issuedAt: '2026-11-01T12:00:00.000Z',
  verifiedAt: '2026-11-01T12:00:00.000Z',
  integrityHash: 'a'.repeat(64),
  status: 'valid',
};
const collection: Collection = {
  earnedCount: 1,
  items: [
    { definition, completed: 1, total: 1, credential: record },
    {
      definition: {
        ...definition,
        id: 'course:python',
        title: 'Python do zero',
        language: 'PYTHON',
      },
      completed: 0,
      total: 1,
      credential: null,
    },
  ],
};
afterEach(cleanup);

it('offers the actual earned certificate and PDF while locked criteria stay visible', () => {
  render(<CredentialCollection collection={collection} />);
  expect(screen.getByRole('link', { name: 'Ver certificado' })).toHaveAttribute(
    'href',
    `/certificates/${record.id}`
  );
  expect(screen.getByRole('link', { name: 'Baixar PDF' })).toHaveAttribute(
    'href',
    `/api/certificates/${record.id}/pdf`
  );
  expect(screen.getAllByText('Como conquistar', { exact: false })).toHaveLength(2);
  fireEvent.change(screen.getByRole('combobox', { name: 'Filtrar certificados' }), {
    target: { value: 'earned' },
  });
  expect(screen.queryByRole('heading', { name: 'Python do zero' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Buscar certificados' }), {
    target: { value: 'inexistente' },
  });
  expect(
    screen.getByRole('heading', { name: 'Nenhum certificado encontrado' })
  ).toBeInTheDocument();
});

it('never offers an earned state or PDF for a revoked record', () => {
  render(
    <CredentialCollection
      collection={{
        earnedCount: 0,
        items: [{ ...collection.items[0], credential: { ...record, status: 'revoked' } }],
      }}
    />
  );
  expect(screen.getByText('Credencial revogada')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Baixar PDF' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Consultar registro' })).toHaveAttribute(
    'href',
    `/certificates/${record.id}`
  );
});
