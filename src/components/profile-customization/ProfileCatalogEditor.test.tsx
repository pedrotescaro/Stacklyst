import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PROFILE_CATALOG, type ProfileCatalog } from '@/lib/profile-customization';
import { ProfileCatalogEditor } from './ProfileCatalogEditor';

let catalog: ProfileCatalog;
let writes: { catalog: ProfileCatalog; version: number }[];
let conflict: boolean;
beforeEach(() => {
  catalog = structuredClone(DEFAULT_PROFILE_CATALOG);
  writes = [];
  conflict = false;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') {
        const body = JSON.parse(init.body as string);
        writes.push(body);
        if (conflict) return Response.json({ error: 'Conflict' }, { status: 409 });
        catalog = body.catalog;
      }
      return Response.json({ catalog, version: 4 + writes.length });
    })
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('profile catalog administration', () => {
  it('publishes real event configuration using the current version', async () => {
    render(<ProfileCatalogEditor />);
    await screen.findByText(`ID estável: ${catalog.events[0].id}`);
    fireEvent.change(screen.getAllByLabelText('Nome do evento')[0], {
      target: { value: 'Halloween da comunidade' },
    });
    fireEvent.click(screen.getAllByLabelText('Evento habilitado no período informado')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    await screen.findByText('Catálogo publicado. As regras já estão disponíveis no servidor.');
    expect(writes[0].version).toBe(4);
    expect(writes[0].catalog.events[0]).toEqual(
      expect.objectContaining({ name: 'Halloween da comunidade', enabled: false })
    );
    expect(writes[0].catalog.achievements).toEqual(DEFAULT_PROFILE_CATALOG.achievements);
  });

  it('rejects an empty event date locally and preserves edits when another administrator wins', async () => {
    render(<ProfileCatalogEditor />);
    await screen.findByText(`ID estável: ${catalog.events[0].id}`);
    const originalDate = screen.getAllByLabelText('Início (UTC)')[0].getAttribute('value')!;
    fireEvent.change(screen.getAllByLabelText('Início (UTC)')[0], { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    await screen.findByRole('alert');
    expect(writes).toHaveLength(0);
    fireEvent.change(screen.getAllByLabelText('Início (UTC)')[0], {
      target: { value: originalDate },
    });
    fireEvent.change(screen.getAllByLabelText('Nome do evento')[0], {
      target: { value: 'Minha nova campanha' },
    });
    conflict = true;
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Outro administrador atualizou o catálogo'
      )
    );
    expect(screen.getAllByLabelText('Nome do evento')[0]).toHaveValue('Minha nova campanha');
    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(screen.getAllByLabelText('Nome do evento')[0]).toHaveValue(
      DEFAULT_PROFILE_CATALOG.events[0].name
    );
  });
});
