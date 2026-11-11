import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { loadSpotifyIframeApi } from '@/lib/spotify-iframe';
import { createSpotifyHarness } from '@/test/spotify-iframe-mock';
import { PostAttachments } from '@/components/posts/PostAttachments';
import {
  MusicPlayerProvider,
  useMusicPlayer,
  type ActiveTrack,
} from '@/contexts/MusicPlayerContext';
import { FloatingMiniPlayer } from '../FloatingMiniPlayer';
import React from 'react';

vi.mock('@/lib/spotify-iframe', () => ({ loadSpotifyIframeApi: vi.fn() }));

const mockTrack: ActiveTrack = {
  id: '4cOdK2wGLETKBW3PvgPWqT',
  title: 'Never Gonna Give You Up',
  artist: 'Rick Astley',
  artworkUrl: 'https://example.com/rick.jpg',
  spotifyUrl: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
};

function TestPlayerTrigger() {
  const { playTrack } = useMusicPlayer();
  return (
    <button type="button" onClick={() => playTrack(mockTrack)}>
      Tocar Rick
    </button>
  );
}

describe('FloatingMiniPlayer', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(loadSpotifyIframeApi).mockReset().mockResolvedValue(createSpotifyHarness(true).api);
  });

  it('does not render when no music is active', () => {
    render(
      <MusicPlayerProvider>
        <FloatingMiniPlayer />
      </MusicPlayerProvider>
    );

    expect(screen.queryByTestId('floating-mini-player')).not.toBeInTheDocument();
  });

  it('renders the expanded player when music is triggered', async () => {
    render(
      <MusicPlayerProvider>
        <TestPlayerTrigger />
        <FloatingMiniPlayer />
      </MusicPlayerProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tocar Rick' }));

    expect(await screen.findByTestId('floating-mini-player')).toBeInTheDocument();
    expect(screen.getByText('Never Gonna Give You Up')).toBeInTheDocument();
    expect(screen.getByText('Rick Astley')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Pausar música' })).toBeInTheDocument();
  });

  it('minimizes and expands cleanly', async () => {
    render(
      <MusicPlayerProvider>
        <TestPlayerTrigger />
        <FloatingMiniPlayer />
      </MusicPlayerProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tocar Rick' }));
    expect(await screen.findByTestId('floating-mini-player')).toBeInTheDocument();

    // Click minimize
    fireEvent.click(screen.getByRole('button', { name: 'Minimizar player' }));

    // Now minimized
    expect(screen.queryByTestId('floating-mini-player')).not.toBeInTheDocument();
    const expandBtn = await screen.findByTestId('floating-mini-player-minimized');
    expect(expandBtn).toBeInTheDocument();

    // Click expand
    fireEvent.click(expandBtn);
    expect(await screen.findByTestId('floating-mini-player')).toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    render(
      <MusicPlayerProvider>
        <TestPlayerTrigger />
        <FloatingMiniPlayer />
      </MusicPlayerProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tocar Rick' }));
    expect(await screen.findByTestId('floating-mini-player')).toBeInTheDocument();

    // Click close
    fireEvent.click(screen.getByRole('button', { name: 'Fechar player' }));

    expect(screen.queryByTestId('floating-mini-player')).not.toBeInTheDocument();
  });

  it('keeps the post and mini player synchronized while loading, playing and pausing', async () => {
    const spotify = createSpotifyHarness();
    vi.mocked(loadSpotifyIframeApi).mockResolvedValue(spotify.api);
    render(
      <MusicPlayerProvider>
        <PostAttachments
          postId="music-post"
          music={{
            trackId: mockTrack.id,
            title: mockTrack.title,
            artist: mockTrack.artist,
            artworkUrl: null,
          }}
        />
        <FloatingMiniPlayer />
      </MusicPlayerProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: `Reproduzir ${mockTrack.title}` }));
    });
    expect(screen.getAllByRole('button', { name: 'Cancelar carregamento da música' })).toHaveLength(
      2
    );
    expect(screen.getByRole('status')).toHaveTextContent('Carregando música');
    act(() => {
      spotify.finishCreation();
      spotify.emit('ready');
      spotify.confirmPlaying();
    });
    expect(screen.getByRole('button', { name: `Pausar ${mockTrack.title}` })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pausar música' }));
    expect(spotify.controller.pause).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('button', { name: `Reproduzir ${mockTrack.title}` })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Pausado');
  });

  it('shows an error and lets the user retry after a network failure', async () => {
    vi.mocked(loadSpotifyIframeApi).mockRejectedValue(new Error('offline'));
    render(
      <MusicPlayerProvider>
        <TestPlayerTrigger />
        <FloatingMiniPlayer />
      </MusicPlayerProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Tocar Rick' }));
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar');
    vi.mocked(loadSpotifyIframeApi).mockResolvedValue(createSpotifyHarness(true).api);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Tentar reproduzir novamente' }));
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pausar música' })).toBeInTheDocument();
  });
});
