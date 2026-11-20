import { vi } from 'vitest';
import type { SpotifySdk, SpotifySdkState } from '@/lib/spotify-web-playback';

export function createSpotifySdkHarness() {
  const listeners = new Map<string, (payload: unknown) => void>();
  const player = {
    connect: vi.fn().mockResolvedValue(true),
    disconnect: vi.fn(),
    activateElement: vi.fn().mockResolvedValue(undefined),
    addListener: vi.fn((event: string, callback: (payload: unknown) => void) => {
      listeners.set(event, callback);
      return true;
    }),
    getCurrentState: vi.fn().mockResolvedValue(null),
    pause: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
    seek: vi.fn().mockResolvedValue(undefined),
  };
  class Player {
    constructor() {
      return player;
    }
  }
  return {
    player,
    sdk: { Player } as unknown as SpotifySdk,
    emit: (event: string, payload?: unknown) => listeners.get(event)?.(payload),
    confirmPlaying(trackId: string, extra?: Partial<SpotifySdkState>) {
      listeners.get('player_state_changed')?.({
        paused: false,
        position: 0,
        duration: 200000,
        track_window: { current_track: { id: trackId, uri: `spotify:track:${trackId}` } },
        ...extra,
      } satisfies SpotifySdkState);
    },
  };
}
