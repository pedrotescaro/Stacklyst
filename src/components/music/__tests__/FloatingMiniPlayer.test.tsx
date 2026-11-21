import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { loadSpotifyWebPlaybackSdk } from '@/lib/spotify-web-playback';
import { fetchSpotifyConnection, getSpotifyAccessToken } from '@/lib/client/spotify-connection';
import { createSpotifySdkHarness } from '@/test/spotify-sdk-mock';
import { installFakeAudio } from '@/test/audio-mock';
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
  let spotifyApi: Mock<(...args: any[]) => Promise<Response>>;
  let media: ReturnType<typeof installFakeAudio>;
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
    spotifyApi = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', (url: string, init?: RequestInit) =>
      String(url).startsWith('/api/spotify/preview/')
        ? Promise.resolve(Response.json({ url: 'https://p.scdn.co/mp3-preview/0123abcd' }))
        : spotifyApi(url, init)
    );
    media = installFakeAudio();
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

  it('plays the 30s preview in our own player, never the Spotify embed', async () => {
    spotifyApi.mockResolvedValue(new Response(null, { status: 403 }));
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
    await act(async () => {
      for (let index = 0; index < 20; index++) await Promise.resolve();
    });
    expect(document.querySelector('iframe')).toBeNull();
    expect(media.audio?.src).toBe('https://p.scdn.co/mp3-preview/0123abcd');
    act(() => media.audio?.startPlaying(30));

    expect(screen.getByTestId('floating-mini-player')).toHaveTextContent('Prévia');
    expect(screen.getByRole('button', { name: 'Pausar música' })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Abrir no Spotify' });
    expect(link).toHaveAttribute('href', mockTrack.spotifyUrl);
    expect(link.querySelector('svg')).not.toBeNull();
    // Seeking is a Premium feature; the preview bar only shows progress.
    expect(screen.getByRole('slider', { name: 'Posição na música' })).toBeDisabled();
    expect(screen.getByTestId('music-seek-bar')).toHaveTextContent('0:30');

    fireEvent.click(screen.getByRole('button', { name: 'Fechar player' }));
    expect(screen.queryByTestId('floating-mini-player')).toBeNull();
    expect(media.audio?.src).toBe('');
  });

  it('shows elapsed and total time and seeks with a connected Premium account', async () => {
    render(
      <MusicPlayerProvider>
        <TestPlayerTrigger />
        <FloatingMiniPlayer />
      </MusicPlayerProvider>
    );
    await startTrack();
    act(() => sdk.confirmPlaying(mockTrack.id, { position: 65000 }));

    const bar = screen.getByTestId('music-seek-bar');
    expect(bar).toHaveTextContent('1:05');
    expect(bar).toHaveTextContent('3:20');
    const slider = screen.getByRole('slider', { name: 'Posição na música' });
    expect(slider).toBeEnabled();
    fireEvent.change(slider, { target: { value: '120000' } });
    expect(sdk.player.seek).toHaveBeenCalledWith(120000);
    expect(bar).toHaveTextContent('2:00');
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
      expect(screen.getByRole('slider', { name: 'Posição na música' })).toBeEnabled();

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
