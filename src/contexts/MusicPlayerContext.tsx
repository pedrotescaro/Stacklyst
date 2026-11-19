'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { loadSpotifyIframeApi, type SpotifyEmbedController } from '@/lib/spotify-iframe';
import {
  loadSpotifyWebPlaybackSdk,
  type SpotifySdkPlayer,
  type SpotifySdkState,
} from '@/lib/spotify-web-playback';
import {
  SPOTIFY_CONNECTION_EVENT,
  fetchSpotifyConnection,
  forgetSpotifyAccessToken,
  getSpotifyAccessToken,
} from '@/lib/client/spotify-connection';

export interface ActiveTrack {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string | null;
  spotifyUrl?: string;
}

interface PlaybackState {
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  progress: number;
}

/**
 * `account`: full tracks through the listener's own connected Spotify Premium
 * account (Web Playback SDK). `embed`: Spotify's public embed, which plays full
 * tracks only when the browser is signed in to Spotify, else 30s previews.
 */
export type PlaybackSource = 'account' | 'embed';

interface MusicPlayerContextType extends PlaybackState {
  currentTrack: ActiveTrack | null;
  playbackSource: PlaybackSource;
  error: string | null;
  isMinimized: boolean;
  playTrack: (track: ActiveTrack) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  minimize: () => void;
  expand: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
  seek: (percent: number) => void;
}

type PlaybackProgress = Pick<PlaybackState, 'position' | 'duration' | 'progress'>;
type MusicPlayerControls = Omit<MusicPlayerContextType, keyof PlaybackProgress>;
const MusicPlayerContext = createContext<MusicPlayerControls | null>(null);
const MusicProgressContext = createContext<PlaybackProgress>({
  position: 0,
  duration: 0,
  progress: 0,
});
const INITIAL_PLAYBACK: PlaybackState = {
  isPlaying: false,
  isBuffering: false,
  position: 0,
  duration: 0,
  progress: 0,
};
const LOAD_ERROR = 'Não foi possível carregar a música. Tente novamente ou abra no Spotify.';

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<ActiveTrack | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [playback, setPlayback] = useState<PlaybackState>(INITIAL_PLAYBACK);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const embedContainerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<ActiveTrack | null>(null);
  const wantsPlayRef = useRef(false);
  const creatingRef = useRef(false);
  const readyRef = useRef(false);
  const loadedIdRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const playbackRef = useRef(INITIAL_PLAYBACK);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource>('embed');
  const sdkRef = useRef<{ player: SpotifySdkPlayer; deviceId: string | null } | null>(null);
  /** True while the current track plays through the connected account. */
  const sdkActiveRef = useRef(false);
  const sdkLoadedIdRef = useRef<string | null>(null);
  /** Tracks the account player refused (region, explicit filter...) use the embed. */
  const embedOnlyIdRef = useRef<string | null>(null);
  const ensureControllerRef = useRef<() => void>(() => {});
  const handleSdkStateRef = useRef<(state: SpotifySdkState | null) => void>(() => {});

  const clearWatchdog = useCallback(() => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const commitPlayback = useCallback((next: PlaybackState) => {
    playbackRef.current = next;
    setPlayback((prev) =>
      Object.keys(next).every(
        (key) => prev[key as keyof PlaybackState] === next[key as keyof PlaybackState]
      )
        ? prev
        : next
    );
  }, []);

  const stopAccountPlayback = useCallback(() => {
    if (sdkActiveRef.current) void sdkRef.current?.player.pause().catch(() => {});
    sdkActiveRef.current = false;
    sdkLoadedIdRef.current = null;
  }, []);

  const disposeController = useCallback(() => {
    ++generationRef.current;
    clearWatchdog();
    const controller = controllerRef.current;
    controllerRef.current = null;
    creatingRef.current = false;
    readyRef.current = false;
    loadedIdRef.current = null;
    try {
      controller?.destroy();
    } catch {
      /* Already detached by Spotify. */
    }
    embedContainerRef.current?.replaceChildren();
  }, [clearWatchdog]);

  const fail = useCallback(
    (message = LOAD_ERROR) => {
      stopAccountPlayback();
      disposeController();
      wantsPlayRef.current = false;
      setError(message);
      setIsMinimized(false);
      setPlayback((prev) => ({ ...prev, isPlaying: false, isBuffering: false }));
    },
    [disposeController, stopAccountPlayback]
  );

  const startWatchdog = useCallback(() => {
    if (timeoutRef.current !== null) return;
    timeoutRef.current = setTimeout(() => {
      fail('O Spotify demorou para responder. Tente novamente ou abra a faixa no Spotify.');
    }, 15000);
  }, [fail]);

  /** Returns false when the account player cannot take this track. */
  const applySdkIntent = useCallback(() => {
    const sdk = sdkRef.current;
    const track = trackRef.current;
    if (!sdk?.deviceId || !track || embedOnlyIdRef.current === track.id) return false;
    sdkActiveRef.current = true;
    if (sdkLoadedIdRef.current === track.id) {
      void (wantsPlayRef.current ? sdk.player.resume() : sdk.player.pause()).catch(() => {});
      return true;
    }
    if (!wantsPlayRef.current) return true;
    sdkLoadedIdRef.current = track.id;
    const generation = generationRef.current;
    const deviceId = sdk.deviceId;
    void getSpotifyAccessToken()
      .then((token) =>
        fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`,
          {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ uris: [`spotify:track:${track.id}`] }),
          }
        )
      )
      .then((response) => {
        if (!response.ok) throw new Error(`Spotify play failed: ${response.status}`);
      })
      .catch(() => {
        if (generation !== generationRef.current || trackRef.current?.id !== track.id) return;
        // Fall back to the public embed rather than leaving the listener stuck.
        embedOnlyIdRef.current = track.id;
        sdkActiveRef.current = false;
        sdkLoadedIdRef.current = null;
        ensureControllerRef.current();
      });
    return true;
  }, []);

  const applyIntent = useCallback(() => {
    if (sdkActiveRef.current && applySdkIntent()) return;
    const controller = controllerRef.current;
    const track = trackRef.current;
    if (!controller || !readyRef.current || !track) return;
    try {
      const changed = loadedIdRef.current !== track.id;
      if (changed) {
        loadedIdRef.current = track.id;
        const uri = `spotify:track:${track.id}`;
        if (controller.loadEntity) controller.loadEntity(uri);
        else controller.loadUri(uri);
      }
      if (wantsPlayRef.current) {
        if (!changed && controller.resume) controller.resume();
        else controller.play();
      } else {
        controller.pause();
      }
    } catch {
      fail();
    }
  }, [applySdkIntent, fail]);

  const ensureController = useCallback(() => {
    if (sdkActiveRef.current || sdkRef.current?.deviceId) {
      if (applySdkIntent()) return;
    }
    if (controllerRef.current) {
      applyIntent();
      return;
    }
    if (creatingRef.current || !trackRef.current) return;
    creatingRef.current = true;
    const generation = generationRef.current;
    void loadSpotifyIframeApi()
      .then((api) => {
        if (generation !== generationRef.current || !trackRef.current || !embedContainerRef.current)
          return;
        const mount = document.createElement('div');
        embedContainerRef.current.replaceChildren(mount);
        loadedIdRef.current = trackRef.current.id;
        api.createController(
          mount,
          {
            uri: `spotify:track:${trackRef.current.id}`,
            width: 300,
            height: 152,
          },
          (controller) => {
            if (generation !== generationRef.current || !trackRef.current) {
              controller.destroy();
              return;
            }
            controllerRef.current = controller;
            creatingRef.current = false;
            controller.addListener('ready', () => {
              if (generation !== generationRef.current || readyRef.current) return;
              readyRef.current = true;
              applyIntent();
            });
            controller.addListener('playback_update', (event) => {
              if (generation !== generationRef.current || !trackRef.current || !readyRef.current)
                return;
              const data = event?.data;
              if (
                !data ||
                (data.playingURI && data.playingURI !== `spotify:track:${trackRef.current.id}`)
              )
                return;
              if (loadedIdRef.current !== trackRef.current.id) return;
              if (typeof data.isPaused !== 'boolean') return;
              const buffering = wantsPlayRef.current && Boolean(data.isBuffering);
              const playing = wantsPlayRef.current && !data.isPaused && !buffering;
              const duration =
                Number.isFinite(data.duration) && data.duration! > 0 ? data.duration! : 0;
              const position = Number.isFinite(data.position) ? Math.max(0, data.position!) : 0;
              if (playing) clearWatchdog();
              else if (buffering) startWatchdog();
              else if (timeoutRef.current === null && data.isPaused) wantsPlayRef.current = false;
              commitPlayback({
                isPlaying: playing,
                isBuffering:
                  buffering || (wantsPlayRef.current && timeoutRef.current !== null && !playing),
                position,
                duration,
                progress: duration ? Math.min(100, (position / duration) * 100) : 0,
              });
            });
          }
        );
      })
      .catch(() => {
        if (generation === generationRef.current) fail();
      });
  }, [applyIntent, applySdkIntent, clearWatchdog, commitPlayback, fail, startWatchdog]);

  useEffect(() => {
    ensureControllerRef.current = ensureController;
  }, [ensureController]);

  const handleSdkState = useCallback(
    (state: SpotifySdkState | null) => {
      const track = trackRef.current;
      if (!state || !track || !sdkActiveRef.current) return;
      const current = state.track_window?.current_track;
      if (current?.id !== track.id && current?.linked_from?.id !== track.id) return;
      const loading = Boolean(state.loading);
      const buffering = wantsPlayRef.current && loading;
      const playing = wantsPlayRef.current && !state.paused && !loading;
      if (playing) clearWatchdog();
      else if (buffering) startWatchdog();
      else if (timeoutRef.current === null && state.paused) wantsPlayRef.current = false;
      const duration = Number.isFinite(state.duration) && state.duration > 0 ? state.duration : 0;
      const position = Number.isFinite(state.position) ? Math.max(0, state.position) : 0;
      commitPlayback({
        isPlaying: playing,
        isBuffering: buffering || (wantsPlayRef.current && timeoutRef.current !== null && !playing),
        position,
        duration,
        progress: duration ? Math.min(100, (position / duration) * 100) : 0,
      });
    },
    [clearWatchdog, commitPlayback, startWatchdog]
  );

  useEffect(() => {
    handleSdkStateRef.current = handleSdkState;
  }, [handleSdkState]);

  // The SDK only reports state changes, so poll the position while playing.
  useEffect(() => {
    if (!playback.isPlaying || playbackSource !== 'account') return;
    const interval = setInterval(() => {
      if (!sdkActiveRef.current) return;
      void sdkRef.current?.player
        .getCurrentState()
        .then((state) => handleSdkStateRef.current(state))
        .catch(() => {});
    }, 1000);
    return () => clearInterval(interval);
  }, [playback.isPlaying, playbackSource]);

  // Connect the listener's own Spotify Premium account when they linked one in
  // settings. Anything else keeps the public embed.
  useEffect(() => {
    let cancelled = false;
    let request: AbortController | null = null;

    const teardown = () => {
      const sdk = sdkRef.current;
      sdkRef.current = null;
      setPlaybackSource('embed');
      const wasActive = sdkActiveRef.current;
      sdkActiveRef.current = false;
      sdkLoadedIdRef.current = null;
      try {
        sdk?.player.disconnect();
      } catch {
        /* Already disconnected. */
      }
      // Keep the music going through the embed if the account player drops out.
      if (!cancelled && wasActive && trackRef.current && wantsPlayRef.current) {
        ensureControllerRef.current();
      }
    };

    const init = async () => {
      request?.abort();
      const current = new AbortController();
      request = current;
      let status;
      try {
        status = await fetchSpotifyConnection(current.signal);
      } catch {
        return;
      }
      if (cancelled || request !== current) return;
      if (!status.connected || !status.premium) {
        if (sdkRef.current) teardown();
        return;
      }
      if (sdkRef.current) return;
      const Spotify = await loadSpotifyWebPlaybackSdk().catch(() => null);
      if (!Spotify || cancelled || request !== current || sdkRef.current) return;
      const entry: { player: SpotifySdkPlayer; deviceId: string | null } = {
        player: new Spotify.Player({
          name: 'Stacklyst',
          volume: 0.8,
          getOAuthToken: (callback) => {
            getSpotifyAccessToken().then(callback, () => {
              if (sdkRef.current === entry) teardown();
            });
          },
        }),
        deviceId: null,
      };
      const player = entry.player;
      sdkRef.current = entry;
      const unusable = () => {
        if (sdkRef.current === entry) teardown();
      };
      player.addListener('ready', (event: { device_id?: string }) => {
        if (sdkRef.current !== entry || typeof event?.device_id !== 'string') return;
        entry.deviceId = event.device_id;
        setPlaybackSource('account');
      });
      player.addListener('not_ready', () => {
        if (sdkRef.current === entry) entry.deviceId = null;
      });
      // account_error: not Premium. authentication_error: token revoked.
      player.addListener('initialization_error', unusable);
      player.addListener('authentication_error', unusable);
      player.addListener('account_error', unusable);
      player.addListener('playback_error', () => {
        const track = trackRef.current;
        if (sdkRef.current !== entry || !sdkActiveRef.current || !track) return;
        embedOnlyIdRef.current = track.id;
        sdkActiveRef.current = false;
        sdkLoadedIdRef.current = null;
        ensureControllerRef.current();
      });
      player.addListener('player_state_changed', (state: SpotifySdkState | null) => {
        if (sdkRef.current === entry) handleSdkStateRef.current(state);
      });
      const connected = await player.connect().catch(() => false);
      if (!connected) unusable();
    };

    void init();
    const onConnectionChange = () => {
      forgetSpotifyAccessToken();
      void init();
    };
    window.addEventListener(SPOTIFY_CONNECTION_EVENT, onConnectionChange);
    return () => {
      cancelled = true;
      request?.abort();
      window.removeEventListener(SPOTIFY_CONNECTION_EVENT, onConnectionChange);
      teardown();
    };
  }, []);

  useEffect(() => {
    void loadSpotifyIframeApi().catch(() => {});
    return () => {
      trackRef.current = null;
      wantsPlayRef.current = false;
      disposeController();
    };
  }, [disposeController]);

  const pause = useCallback(() => {
    wantsPlayRef.current = false;
    clearWatchdog();
    setPlayback((prev) => ({ ...prev, isPlaying: false, isBuffering: false }));
    applyIntent();
  }, [applyIntent, clearWatchdog]);

  const resume = useCallback(() => {
    if (!trackRef.current) return;
    wantsPlayRef.current = true;
    // Browsers only allow audio started from a user gesture; unlock it now.
    void sdkRef.current?.player.activateElement?.().catch(() => {});
    setError(null);
    setPlayback((prev) => ({ ...prev, isPlaying: false, isBuffering: true }));
    startWatchdog();
    ensureController();
  }, [ensureController, startWatchdog]);

  const togglePlay = useCallback(() => {
    if (wantsPlayRef.current) pause();
    else resume();
  }, [pause, resume]);

  const playTrack = useCallback(
    (track: ActiveTrack) => {
      if (!/^[a-zA-Z0-9]{22}$/.test(track.id)) return;
      if (trackRef.current?.id === track.id) {
        togglePlay();
        return;
      }
      if (sdkActiveRef.current) void sdkRef.current?.player.pause().catch(() => {});
      sdkActiveRef.current = false;
      sdkLoadedIdRef.current = null;
      if (embedOnlyIdRef.current !== track.id) embedOnlyIdRef.current = null;
      // Silence an embed from a previous track when the account player takes over.
      if (sdkRef.current?.deviceId && controllerRef.current) {
        try {
          controllerRef.current.pause();
        } catch {
          /* The embed is replaced on its next use anyway. */
        }
      }
      trackRef.current = track;
      setCurrentTrack(track);
      setIsMinimized(false);
      clearWatchdog();
      playbackRef.current = INITIAL_PLAYBACK;
      setPlayback({ ...INITIAL_PLAYBACK, isBuffering: true });
      resume();
    },
    [clearWatchdog, resume, togglePlay]
  );

  const closePlayer = useCallback(() => {
    trackRef.current = null;
    wantsPlayRef.current = false;
    stopAccountPlayback();
    embedOnlyIdRef.current = null;
    disposeController();
    setCurrentTrack(null);
    setError(null);
    setIsMinimized(false);
    playbackRef.current = INITIAL_PLAYBACK;
    setPlayback(INITIAL_PLAYBACK);
  }, [disposeController, stopAccountPlayback]);

  const seek = useCallback(
    (percent: number) => {
      if (sdkActiveRef.current && sdkRef.current && Number.isFinite(percent)) {
        const duration = playbackRef.current.duration;
        if (!duration) return;
        const bounded = Math.max(0, Math.min(100, percent));
        void sdkRef.current.player.seek(Math.round((bounded / 100) * duration)).catch(() => {});
        return;
      }
      if (!controllerRef.current || !readyRef.current || !Number.isFinite(percent)) return;
      const duration = playbackRef.current.duration;
      if (!duration) return;
      const bounded = Math.max(0, Math.min(100, percent));
      try {
        controllerRef.current.seek(Math.round(((bounded / 100) * duration) / 1000));
      } catch {
        fail();
      }
    },
    [fail]
  );

  const minimize = useCallback(() => setIsMinimized(true), []);
  const expand = useCallback(() => setIsMinimized(false), []);
  const toggleMinimize = useCallback(() => setIsMinimized((prev) => !prev), []);

  // Frequent position messages must not rerender every music card in the feed.
  const controls = useMemo(
    () => ({
      currentTrack,
      playbackSource,
      isPlaying: playback.isPlaying,
      isBuffering: playback.isBuffering,
      error,
      isMinimized,
      playTrack,
      togglePlay,
      pause,
      resume,
      minimize,
      expand,
      toggleMinimize,
      closePlayer,
      seek,
    }),
    [
      currentTrack,
      playbackSource,
      playback.isPlaying,
      playback.isBuffering,
      error,
      isMinimized,
      playTrack,
      togglePlay,
      pause,
      resume,
      minimize,
      expand,
      toggleMinimize,
      closePlayer,
      seek,
    ]
  );
  const progress = useMemo(
    () => ({
      position: playback.position,
      duration: playback.duration,
      progress: playback.progress,
    }),
    [playback.position, playback.duration, playback.progress]
  );

  return (
    <MusicPlayerContext.Provider value={controls}>
      <MusicProgressContext.Provider value={progress}>
        {children}
        <div
          ref={embedContainerRef}
          id="spotify-iframe-embed-host"
          className="pointer-events-none fixed bottom-0 right-0 h-[152px] w-[300px] overflow-hidden opacity-[0.001] z-[-50]"
          aria-hidden="true"
        />
      </MusicProgressContext.Provider>
    </MusicPlayerContext.Provider>
  );
}

const defaultMusicPlayerContext: MusicPlayerContextType = {
  ...INITIAL_PLAYBACK,
  currentTrack: null,
  playbackSource: 'embed',
  error: null,
  isMinimized: false,
  playTrack: () => {},
  togglePlay: () => {},
  pause: () => {},
  resume: () => {},
  minimize: () => {},
  expand: () => {},
  toggleMinimize: () => {},
  closePlayer: () => {},
  seek: () => {},
};

export function useMusicPlayer() {
  const controls = useMusicPlayerControls();
  const progress = useContext(MusicProgressContext);
  return { ...controls, ...progress };
}

export function useMusicPlayerControls(): MusicPlayerControls {
  return useContext(MusicPlayerContext) ?? defaultMusicPlayerContext;
}
