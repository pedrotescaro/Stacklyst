import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MusicSelector } from './MusicSelector';

const track = {
  trackId: '11dFghVXANMlKmJXsNCbNl',
  title: 'Best Friend',
  artist: '',
  artworkUrl: null,
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('Spotify selection in a post form', () => {
  it('searches on Enter without publishing the outer post and marks the selected track', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn().mockResolvedValue(Response.json({ configured: true, tracks: [track] }));
    vi.stubGlobal('fetch', fetcher);
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const change = vi.fn();
    render(
      <form onSubmit={submit}>
        <MusicSelector value={track} onChange={change} context="post" />
        <button type="submit">Publicar</button>
      </form>
    );
    const input = screen.getByLabelText('Pesquisar música ou artista');
    fireEvent.change(input, { target: { value: 'Best Friend' } });
    expect(screen.queryByText(/Nenhuma faixa encontrada/)).not.toBeInTheDocument();
    let defaultAllowed = true;
    await act(async () => {
      defaultAllowed = fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(defaultAllowed).toBe(false);
    expect(submit).not.toHaveBeenCalled();
    const choice = screen.getByRole('button', { name: 'Selecionar Best Friend', pressed: true });
    fireEvent.click(choice);
    expect(change).toHaveBeenCalledWith(track);
    expect(screen.getByRole('link', { name: 'Abrir Best Friend no Spotify' })).toHaveAttribute(
      'href',
      `https://open.spotify.com/track/${track.trackId}`
    );
    await act(async () => vi.advanceTimersByTime(400));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('ignores an older response after a new query and only shows empty results after searching', async () => {
    vi.useFakeTimers();
    let finishOld!: (response: Response) => void;
    const fetcher = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            finishOld = resolve;
          })
      )
      .mockResolvedValueOnce(Response.json({ configured: true, tracks: [] }));
    vi.stubGlobal('fetch', fetcher);
    render(<MusicSelector value={null} onChange={vi.fn()} context="post" />);
    const input = screen.getByLabelText('Pesquisar música ou artista');
    fireEvent.change(input, { target: { value: 'Best Friend' } });
    await act(async () => vi.advanceTimersByTime(350));
    fireEvent.change(input, { target: { value: 'Outra faixa' } });
    expect(screen.queryByText(/Nenhuma faixa encontrada/)).not.toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(350));
    expect(screen.getByText(/Nenhuma faixa encontrada/)).toBeInTheDocument();
    await act(async () => finishOld(Response.json({ configured: true, tracks: [track] })));
    expect(
      screen.queryByRole('button', { name: 'Selecionar Best Friend' })
    ).not.toBeInTheDocument();
  });

  it('resolves a Spotify link on Enter without submitting the post', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json(track));
    vi.stubGlobal('fetch', fetcher);
    const change = vi.fn();
    render(<MusicSelector value={null} onChange={change} context="post" />);
    const input = screen.getByLabelText('Link alternativo do Spotify');
    fireEvent.change(input, {
      target: { value: `https://open.spotify.com/track/${track.trackId}` },
    });
    await act(async () => {
      expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(false);
    });
    expect(change).toHaveBeenCalledWith(track);
    expect(fetcher.mock.calls[0][0]).toBe('/api/profile/music/resolve');
  });
});
