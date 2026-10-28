import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContextPopover } from './ContextPopover';
import { FlagSelector } from './FlagSelector';
import { MusicSelector } from './MusicSelector';
import { useState } from 'react';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe('Profile contextual controls', () => {
  it('opens next to its trigger, focuses the input and restores focus on Escape', async () => {
    const user = userEvent.setup();
    render(
      <ContextPopover label="Editar bandeiras">
        <input aria-label="Buscar bandeira" />
      </ContextPopover>
    );
    const trigger = screen.getByRole('button', { name: 'Editar bandeiras' });
    await user.click(trigger);
    await waitFor(() => expect(screen.getByLabelText('Buscar bandeira')).toHaveFocus());
    expect(screen.getByRole('dialog', { name: 'Editar bandeiras' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('closes a contextual editor when saving disables its trigger', async () => {
    const view = render(
      <ContextPopover label="Editar música">
        <input aria-label="Consulta" />
      </ContextPopover>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Editar música' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    view.rerender(
      <ContextPopover label="Editar música" disabled>
        <input aria-label="Consulta" />
      </ContextPopover>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    view.rerender(
      <ContextPopover label="Editar música">
        <input aria-label="Consulta" />
      </ContextPopover>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('keeps at most three flags, permits removal and searches state/pride/community catalogs', () => {
    function Fixture() {
      const [value, setValue] = useState(['BR', 'br-sp', 'pride-trans']);
      return <FlagSelector value={value} onChange={setValue} />;
    }
    render(<Fixture />);
    fireEvent.click(screen.getByRole('button', { name: 'Estados do Brasil' }));
    const grid = screen.getByRole('button', { name: 'Acre' });
    expect(grid).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Remover bandeira Transgênero' }));
    expect(grid).toBeEnabled();
    fireEvent.click(grid);
    expect(screen.getByRole('button', { name: 'Remover bandeira Acre' })).toBeInTheDocument();
    expect(screen.getByText('3/3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Todas' }));
    fireEvent.change(screen.getByLabelText('Pesquisar bandeira'), {
      target: { value: 'comunista' },
    });
    expect(screen.getByRole('button', { name: /Comunista/ })).toBeInTheDocument();
  });
  it('debounces search, paginates real results and changes only the local music selection', async () => {
    vi.useFakeTimers();
    const track = {
      trackId: '11dFghVXANMlKmJXsNCbNl',
      title: 'Cut To The Feeling',
      artist: 'Carly Rae Jepsen',
      artworkUrl: null,
      album: 'Emotion',
      durationMs: 208000,
    };
    const second = {
      ...track,
      trackId: '4cOdK2wGLETKBW3PvgPWqT',
      title: 'Never Gonna Give You Up',
    };
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ configured: true, tracks: [track], nextOffset: 10 }))
      .mockResolvedValueOnce(
        Response.json({ configured: true, tracks: [second], nextOffset: null })
      );
    vi.stubGlobal('fetch', fetcher);
    const change = vi.fn();
    render(<MusicSelector value={null} onChange={change} />);
    fireEvent.change(screen.getByLabelText('Pesquisar música ou artista'), {
      target: { value: 'Lady' },
    });
    await act(async () => vi.advanceTimersByTime(200));
    fireEvent.change(screen.getByLabelText('Pesquisar música ou artista'), {
      target: { value: 'Lady Gaga' },
    });
    await act(async () => vi.advanceTimersByTime(349));
    expect(fetcher).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTime(1));
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Emotion · 3:28')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Carregar mais músicas' }));
    await act(async () => Promise.resolve());
    expect(fetcher.mock.calls[1][0]).toContain('offset=10');
    fireEvent.click(
      screen.getByRole('button', { name: 'Selecionar Cut To The Feeling de Carly Rae Jepsen' })
    );
    expect(change).toHaveBeenCalledWith(track);
    expect(
      fetcher.mock.calls.every(([url]) => String(url).startsWith('/api/profile/music/search'))
    ).toBe(true);
  });
  it('explains unavailable name search and resolves an official URL without persisting anything', async () => {
    vi.useFakeTimers();
    const track = {
      trackId: '11dFghVXANMlKmJXsNCbNl',
      title: 'Official title',
      artist: 'Artist',
      artworkUrl: null,
      metadataUnavailable: true,
    };
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          configured: false,
          tracks: [],
          reason: 'approval_required',
          message: 'Busca requer aprovação. Use um link.',
        })
      )
      .mockResolvedValueOnce(Response.json(track));
    vi.stubGlobal('fetch', fetcher);
    const change = vi.fn();
    render(<MusicSelector value={null} onChange={change} />);
    fireEvent.change(screen.getByLabelText('Pesquisar música ou artista'), {
      target: { value: 'Gaga' },
    });
    await act(async () => vi.advanceTimersByTime(350));
    expect(screen.getByText('Busca requer aprovação. Use um link.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Link alternativo do Spotify'), {
      target: { value: 'https://open.spotify.com/track/' + track.trackId },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Usar link da faixa' }));
    await act(async () => Promise.resolve());
    expect(change).toHaveBeenCalledWith({
      trackId: track.trackId,
      title: track.title,
      artist: track.artist,
      artworkUrl: null,
    });
    expect(fetcher.mock.calls[1][0]).toBe('/api/profile/music/resolve');
  });
  it('cancels a queued name search when the user explicitly selects an official link', async () => {
    vi.useFakeTimers();
    const track = {
      trackId: '11dFghVXANMlKmJXsNCbNl',
      title: 'Official title',
      artist: '',
      artworkUrl: null,
    };
    const fetcher = vi.fn().mockResolvedValue(Response.json(track));
    vi.stubGlobal('fetch', fetcher);
    const change = vi.fn();
    render(<MusicSelector value={null} onChange={change} />);
    fireEvent.change(screen.getByLabelText('Pesquisar música ou artista'), {
      target: { value: 'Gaga' },
    });
    fireEvent.change(screen.getByLabelText('Link alternativo do Spotify'), {
      target: { value: 'https://open.spotify.com/track/' + track.trackId },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Usar link da faixa' }));
    await act(async () => vi.advanceTimersByTime(400));
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toBe('/api/profile/music/resolve');
    expect(change).toHaveBeenCalledWith(track);
  });
});
