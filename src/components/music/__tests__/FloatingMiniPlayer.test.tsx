import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  MusicPlayerProvider,
  useMusicPlayer,
  type ActiveTrack,
} from '@/contexts/MusicPlayerContext';
import { FloatingMiniPlayer } from '../FloatingMiniPlayer';
import React from 'react';

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
    expect(screen.getByRole('button', { name: 'Pausar música' })).toBeInTheDocument();
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
});
