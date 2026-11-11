import { vi } from 'vitest';
import type {
  SpotifyEmbedController,
  SpotifyIframeApi,
  SpotifyPlaybackEvent,
} from '@/lib/spotify-iframe';

export function createSpotifyHarness(autoPlay = false) {
  const listeners = new Map<string, (event: SpotifyPlaybackEvent) => void>();
  let uri = '';
  const emit = (event: string, data: SpotifyPlaybackEvent['data'] = {}) =>
    listeners.get(event)?.({ data });
  const confirmPlaying = () =>
    emit('playback_update', {
      playingURI: uri,
      isPaused: false,
      isBuffering: false,
      position: 0,
      duration: 180000,
    });
  const controller = {
    loadEntity: vi.fn((next: string) => {
      uri = next;
    }),
    loadUri: vi.fn((next: string) => {
      uri = next;
    }),
    play: vi.fn(() => {
      if (autoPlay) confirmPlaying();
    }),
    resume: vi.fn(() => {
      if (autoPlay) confirmPlaying();
    }),
    pause: vi.fn(),
    seek: vi.fn(),
    destroy: vi.fn(),
    addListener: vi.fn((event: string, handler: (event: SpotifyPlaybackEvent) => void) =>
      listeners.set(event, handler)
    ),
  } satisfies SpotifyEmbedController;
  let callback: ((controller: SpotifyEmbedController) => void) | undefined;
  const api: SpotifyIframeApi = {
    createController: vi.fn((_element, options, onCreate) => {
      uri = options.uri;
      callback = onCreate;
      if (autoPlay) {
        onCreate(controller);
        emit('ready');
      }
    }),
  };
  return { api, controller, emit, confirmPlaying, finishCreation: () => callback?.(controller) };
}
