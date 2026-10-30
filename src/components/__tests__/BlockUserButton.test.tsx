import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlockUserButton } from '../BlockUserButton';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('BlockUserButton', () => {
  it('explains mutual blocking and requires confirmation before writing', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ blocked: true })));
    vi.stubGlobal('fetch', fetchMock);
    const onChanged = vi.fn();
    render(<BlockUserButton userId="target" username="developer" onChanged={onChanged} />);
    fireEvent.click(screen.getByRole('button', { name: 'Bloquear @developer' }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/não poderão interagir/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar bloqueio' }));
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith(true));
    expect(fetchMock).toHaveBeenCalledWith('/api/users/target/block', { method: 'POST' });
  });

  it('allows cancellation and reports failed requests without claiming success', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);
    const onChanged = vi.fn();
    render(<BlockUserButton userId="target" username="developer" onChanged={onChanged} />);
    fireEvent.click(screen.getByRole('button', { name: 'Bloquear @developer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Bloquear @developer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar bloqueio' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Tente novamente');
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('uses DELETE to remove the requester’s block', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ blocked: false })));
    vi.stubGlobal('fetch', fetchMock);
    const onChanged = vi.fn();
    render(<BlockUserButton userId="target" username="developer" blocked onChanged={onChanged} />);
    fireEvent.click(screen.getByRole('button', { name: 'Desbloquear' }));
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith(false));
    expect(fetchMock).toHaveBeenCalledWith('/api/users/target/block', { method: 'DELETE' });
  });
});
