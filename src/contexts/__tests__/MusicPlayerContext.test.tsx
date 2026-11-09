import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { MusicPlayerProvider, useMusicPlayer, type ActiveTrack } from '../MusicPlayerContext';
import React from 'react';

const mockTrack1: ActiveTrack = {
  id: 'track-123456789012345678',
  title: 'Sweater Weather',
  artist: 'The Neighbourhood',
  artworkUrl: 'https://example.com/sweater.jpg',
  spotifyUrl: 'https://open.spotify.com/track/track-123456789012345678',
};

const mockTrack2: ActiveTrack = {
  id: 'track-987654321098765432',
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  artworkUrl: 'https://example.com/queen.jpg',
  spotifyUrl: 'https://open.spotify.com/track/track-987654321098765432',
};

describe('MusicPlayerContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with no active track', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MusicPlayerProvider>{children}</MusicPlayerProvider>
    );

    const { result } = renderHook(() => useMusicPlayer(), { wrapper });

    expect(result.current.currentTrack).toBeNull();
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isMinimized).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('plays a track and switches active tracks', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MusicPlayerProvider>{children}</MusicPlayerProvider>
    );

    const { result } = renderHook(() => useMusicPlayer(), { wrapper });

    act(() => {
      result.current.playTrack(mockTrack1);
    });

    expect(result.current.currentTrack).toEqual(mockTrack1);
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.isMinimized).toBe(false);

    // Switch to track 2
    act(() => {
      result.current.playTrack(mockTrack2);
    });

    expect(result.current.currentTrack).toEqual(mockTrack2);
    expect(result.current.isPlaying).toBe(true);
  });

  it('minimizes, expands and toggles player state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MusicPlayerProvider>{children}</MusicPlayerProvider>
    );

    const { result } = renderHook(() => useMusicPlayer(), { wrapper });

    act(() => {
      result.current.playTrack(mockTrack1);
      result.current.minimize();
    });

    expect(result.current.isMinimized).toBe(true);

    act(() => {
      result.current.expand();
    });

    expect(result.current.isMinimized).toBe(false);

    act(() => {
      result.current.toggleMinimize();
    });

    expect(result.current.isMinimized).toBe(true);
  });

  it('closes player and resets state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MusicPlayerProvider>{children}</MusicPlayerProvider>
    );

    const { result } = renderHook(() => useMusicPlayer(), { wrapper });

    act(() => {
      result.current.playTrack(mockTrack1);
    });

    expect(result.current.currentTrack).not.toBeNull();

    act(() => {
      result.current.closePlayer();
    });

    expect(result.current.currentTrack).toBeNull();
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.progress).toBe(0);
  });
});
