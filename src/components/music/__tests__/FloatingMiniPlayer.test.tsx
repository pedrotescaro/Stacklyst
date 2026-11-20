import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { loadSpotifyWebPlaybackSdk } from '@/lib/spotify-web-playback';
import { fetchSpotifyConnection, getSpotifyAccessToken } from '@/lib/client/spotify-connection';
import { createSpotifySdkHarness } from '@/test/spotify-sdk-mock';
import { PostAttachments } from '@/components/posts/PostAttachments';
import {
  MusicPlayerProvider,
  useMusicPlayer,
  type ActiveTrack,
} from '@/contexts/MusicPlayerContext';
import { FloatingMiniPlayer } from '../FloatingMiniPlayer';
import React from 'react';

vi.mock(import('@/lib/spotify-web-playback'), async (importOriginal) => ({
  ...(await importOriginal()),
  loadSpotifyWebPlaybackSdk: vi.fn(),
}));
vi.mock('@/lib/client/spotify-connection', () => ({
  SPOTIFY_CONNECTION_EVENT: 'stacklyst:spotify-connection',
  fetchSpotifyConnection: vi.fn(),
  getSpotifyAccessToken: vi.fn(),
  forgetSpotifyAccessToken: vi.fn(),
}));

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
  let sdk: ReturnType<typeof createSpotifySdkHarness>;
  const ready = async () => {
    await act(async () => {});
    act(() => sdk.emit('ready', { device_id: 'device-1' }));
  };
  const startTrack = async () => {
    await ready();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Tocar Rick' }));
    });
    act(() => sdk.confirmPlaying(mockTrack.id));
  };
  beforeEach(() => {
    window.localStorage.clear();
    sdk = createSpotifySdkHarness();
    vi.mocked(loadSpotifyWebPlaybackSdk).mockResolvedValue(sdk.sdk);
    vi.mocked(fetchSpotifyConnection).mockResolvedValue({
      configured: true,
      connected: true,
      premium: true,
    });
    vi.mocked(getSpotifyAccessToken).mockResolvedValue('test-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
  });

  afterEach(() => vi.unstubAllGlobals());

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

    await startTrack();

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

    await startTrack();
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

    await startTrack();
    expect(await screen.findByTestId('floating-mini-player')).toBeInTheDocument();

    // Click close
    fireEvent.click(screen.getByRole('button', { name: 'Fechar player' }));

    expect(screen.queryByTestId('floating-mini-player')).not.toBeInTheDocument();
  });

  it('keeps the post and mini player synchronized while loading, playing and pausing', async () => {
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
    await ready();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: `Reproduzir ${mockTrack.title}` }));
    });
    expect(screen.getAllByRole('button', { name: 'Cancelar carregamento da música' })).toHaveLength(
      2
    );
    expect(screen.getByRole('status')).toHaveTextContent('Carregando música');
    act(() => sdk.confirmPlaying(mockTrack.id));
    expect(screen.getByRole('button', { name: `Pausar ${mockTrack.title}` })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pausar música' }));
    expect(sdk.player.pause).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('button', { name: `Reproduzir ${mockTrack.title}` })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Pausado');
  });

  it('provides the official embed and a Spotify link if account playback fails', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 403 }));
    render(
      <MusicPlayerProvider>
        <TestPlayerTrigger />
        <FloatingMiniPlayer />
      </MusicPlayerProvider>
    );
    await ready();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Tocar Rick' }));
    });
    expect(screen.getByTitle(`${mockTrack.title} · Spotify`)).toHaveAttribute(
      'src',
      `https://open.spotify.com/embed/track/${mockTrack.id}`
    );
    expect(screen.getByRole('link', { name: 'Abrir no Spotify' })).toHaveAttribute(
      'href',
      mockTrack.spotifyUrl
    );
    expect(screen.queryByRole('button', { name: 'Cancelar carregamento da música' })).toBeNull();
    expect(document.querySelector('script[src*="/embed/iframe-api"]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar player' }));
    expect(screen.queryByTitle(`${mockTrack.title} · Spotify`)).toBeNull();
  });

  it('docks a compact now-playing bar on phones', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
    );
    try {
      render(
        <MusicPlayerProvider>
          <TestPlayerTrigger />
          <FloatingMiniPlayer />
        </MusicPlayerProvider>
      );
      await startTrack();

      const bar = await screen.findByTestId('floating-mini-player');
      expect(bar).toHaveAttribute('data-layout', 'mobile');
      expect(screen.getByText('Never Gonna Give You Up')).toBeInTheDocument();
      // Desktop-only extras stay out of the compact bar.
      expect(
        screen.queryByRole('button', { name: 'Compartilhar faixa do Spotify' })
      ).not.toBeInTheDocument();
      expect(await screen.findByRole('button', { name: 'Pausar música' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Minimizar player' }));
      expect(await screen.findByTestId('floating-mini-player-minimized')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('floating-mini-player-minimized'));
      fireEvent.click(await screen.findByRole('button', { name: 'Fechar player' }));
      expect(screen.queryByTestId('floating-mini-player')).not.toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
