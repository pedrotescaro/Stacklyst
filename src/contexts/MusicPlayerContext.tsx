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
import {
  loadSpotifyWebPlaybackSdk,
  startSpotifyTrack,
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
  isEmbedOpen: boolean;
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
const PLAYBACK_TIMEOUT = 12000;

interface AccountPlayer {
  player: SpotifySdkPlayer;
  deviceId: string | null;
  loadedId: string | null;
}

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<ActiveTrack | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [playback, setPlayback] = useState<PlaybackState>(INITIAL_PLAYBACK);
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource>('embed');
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const trackRef = useRef<ActiveTrack | null>(null);
  const wantsPlayRef = useRef(false);
  const embedOpenRef = useRef(false);
  const checkingAccount = useRef(true);
  const sdkRef = useRef<AccountPlayer | null>(null);
  const playRequest = useRef<AbortController | null>(null);
  const playbackRef = useRef(INITIAL_PLAYBACK);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commitPlayback = useCallback((next: PlaybackState) => {
    playbackRef.current = next;
    setPlayback((previous) =>
      previous.isPlaying === next.isPlaying &&
      previous.isBuffering === next.isBuffering &&
      previous.position === next.position &&
      previous.duration === next.duration
        ? previous
        : next
    );
  }, []);

  const clearWatchdog = useCallback(() => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const stopPending = useCallback(() => {
    playRequest.current?.abort();
    playRequest.current = null;
    clearWatchdog();
  }, [clearWatchdog]);

  const openEmbed = useCallback(() => {
    if (!trackRef.current || !wantsPlayRef.current) return;
    stopPending();
    wantsPlayRef.current = false;
    const sdk = sdkRef.current;
    if (sdk?.loadedId) {
      sdk.loadedId = null;
      void sdk.player.pause().catch(() => {});
    }
    embedOpenRef.current = true;
    setIsEmbedOpen(true);
    setIsMinimized(false);
    setPlaybackSource('embed');
    commitPlayback(INITIAL_PLAYBACK);
  }, [commitPlayback, stopPending]);

  const startWatchdog = useCallback(() => {
    if (timeoutRef.current === null) {
      timeoutRef.current = setTimeout(openEmbed, PLAYBACK_TIMEOUT);
    }
  }, [openEmbed]);

  const playOnDevice = useCallback(() => {
    const track = trackRef.current;
    const sdk = sdkRef.current;
    if (!track || !wantsPlayRef.current || embedOpenRef.current) return;
    if (!sdk?.deviceId) {
      if (!checkingAccount.current && !sdk) openEmbed();
      return;
    }
    if (playRequest.current) return;

    setPlaybackSource('account');
    const deviceId = sdk.deviceId;
    const controller = new AbortController();
    playRequest.current = controller;
    const alreadyLoaded = sdk.loadedId === track.id && playbackRef.current.duration > 0;
    sdk.loadedId = track.id;
    void (async () => {
      try {
        if (alreadyLoaded) {
          await sdk.player.resume();
        } else {
          const token = await getSpotifyAccessToken();
          controller.signal.throwIfAborted();
          const started = await startSpotifyTrack(token, deviceId, track.id, controller.signal);
          if (!started && !controller.signal.aborted) openEmbed();
        }
      } catch {
        if (!controller.signal.aborted) openEmbed();
      } finally {
        if (playRequest.current === controller) playRequest.current = null;
      }
    })();
  }, [openEmbed]);

  const handleSdkState = useCallback(
    (state: SpotifySdkState | null) => {
      const track = trackRef.current;
      const sdk = sdkRef.current;
      if (!state || !track || !sdk?.deviceId || sdk.loadedId !== track.id || embedOpenRef.current)
        return;
      const current = state.track_window?.current_track;
      if (current?.id !== track.id && current?.linked_from?.id !== track.id) return;
      if (!wantsPlayRef.current && !state.paused) {
        // A play request can reach Spotify just before it was cancelled.
        void sdk.player.pause().catch(() => {});
        return;
      }
      const loading = Boolean(state.loading);
      const playing = wantsPlayRef.current && !state.paused && !loading;
      if (playing) clearWatchdog();
      else if (wantsPlayRef.current && loading) startWatchdog();
      else if (timeoutRef.current === null && state.paused) wantsPlayRef.current = false;
      const duration = Number.isFinite(state.duration) && state.duration > 0 ? state.duration : 0;
      const position = Number.isFinite(state.position) ? Math.max(0, state.position) : 0;
      commitPlayback({
        isPlaying: playing,
        isBuffering: wantsPlayRef.current && !playing && timeoutRef.current !== null,
        position,
        duration,
        progress: duration ? Math.min(100, (position / duration) * 100) : 0,
      });
    },
    [clearWatchdog, commitPlayback, startWatchdog]
  );

  useEffect(() => {
    if (!playback.isPlaying) return;
    const interval = setInterval(() => {
      const sdk = sdkRef.current;
      if (!sdk?.deviceId) return;
      void sdk.player
        .getCurrentState()
        .then((state) => {
          if (sdkRef.current === sdk) handleSdkState(state);
        })
        .catch(() => {});
    }, 1000);
    return () => clearInterval(interval);
  }, [handleSdkState, playback.isPlaying]);

  useEffect(() => {
    let request: AbortController | null = null;

    const disconnectPlayer = () => {
      stopPending();
      const sdk = sdkRef.current;
      sdkRef.current = null;
      try {
        sdk?.player.disconnect();
      } catch {
        // The SDK may have disconnected before notifying us.
      }
    };
    const unavailable = () => {
      checkingAccount.current = false;
      disconnectPlayer();
      setPlaybackSource('embed');
      openEmbed();
    };

    const connectPlayer = async () => {
      request?.abort();
      request = new AbortController();
      const { signal } = request;
      checkingAccount.current = true;
      try {
        const status = await fetchSpotifyConnection(signal);
        if (signal.aborted) return;
        if (!status.connected || !status.premium) {
          unavailable();
          return;
        }
        const Spotify = await loadSpotifyWebPlaybackSdk();
        if (signal.aborted) return;
        const entry: AccountPlayer = {
          player: new Spotify.Player({
            name: 'Stacklyst',
            volume: 0.8,
            getOAuthToken: (callback) => {
              void getSpotifyAccessToken().then(
                (token) => {
                  if (sdkRef.current === entry) callback(token);
                },
                () => {
                  if (sdkRef.current === entry) unavailable();
                }
              );
            },
          }),
          deviceId: null,
          loadedId: null,
        };
        const player = entry.player;
        sdkRef.current = entry;
        const unusable = () => {
          if (sdkRef.current === entry) unavailable();
        };
        player.addListener('ready', (event: { device_id?: string }) => {
          if (sdkRef.current !== entry || typeof event?.device_id !== 'string' || !event.device_id)
            return;
          checkingAccount.current = false;
          if (entry.deviceId !== event.device_id) {
            playRequest.current?.abort();
            playRequest.current = null;
            entry.deviceId = event.device_id;
            entry.loadedId = null;
          }
          if (!embedOpenRef.current) setPlaybackSource('account');
          if (entry.loadedId !== trackRef.current?.id) playOnDevice();
        });
        player.addListener('not_ready', (event: { device_id?: string }) => {
          if (sdkRef.current !== entry || (event?.device_id && event.device_id !== entry.deviceId))
            return;
          entry.deviceId = null;
          entry.loadedId = null;
          playRequest.current?.abort();
          playRequest.current = null;
          if (!wantsPlayRef.current) return;
          commitPlayback({ ...playbackRef.current, isPlaying: false, isBuffering: true });
          startWatchdog();
        });
        player.addListener('initialization_error', unusable);
        player.addListener('authentication_error', unusable);
        player.addListener('account_error', unusable);
        const useEmbedIfPlaying = () => {
          if (sdkRef.current === entry && entry.loadedId === trackRef.current?.id) openEmbed();
        };
        player.addListener('playback_error', useEmbedIfPlaying);
        player.addListener('autoplay_failed', useEmbedIfPlaying);
        player.addListener('player_state_changed', (state: SpotifySdkState | null) => {
          if (sdkRef.current === entry) handleSdkState(state);
        });
        if (!(await player.connect()) && !signal.aborted) unusable();
      } catch {
        if (!signal.aborted) unavailable();
      }
    };

    const onConnectionChange = () => {
      forgetSpotifyAccessToken();
      disconnectPlayer();
      if (wantsPlayRef.current) {
        commitPlayback({ ...playbackRef.current, isPlaying: false, isBuffering: true });
        startWatchdog();
      }
      void connectPlayer();
    };
    void connectPlayer();
    window.addEventListener(SPOTIFY_CONNECTION_EVENT, onConnectionChange);
    return () => {
      request?.abort();
      window.removeEventListener(SPOTIFY_CONNECTION_EVENT, onConnectionChange);
      wantsPlayRef.current = false;
      disconnectPlayer();
    };
  }, [commitPlayback, handleSdkState, openEmbed, playOnDevice, startWatchdog, stopPending]);

  const pause = useCallback(() => {
    wantsPlayRef.current = false;
    stopPending();
    const sdk = sdkRef.current;
    if (sdk?.loadedId) {
      void sdk.player.pause().catch(() => {});
    }
    commitPlayback({ ...playbackRef.current, isPlaying: false, isBuffering: false });
  }, [commitPlayback, stopPending]);

  const resume = useCallback(() => {
    if (!trackRef.current) return;
    if (embedOpenRef.current) {
      setIsMinimized(false);
      return;
    }
    wantsPlayRef.current = true;
    void sdkRef.current?.player.activateElement?.().catch(() => {});
    commitPlayback({ ...playbackRef.current, isPlaying: false, isBuffering: true });
    startWatchdog();
    playOnDevice();
  }, [commitPlayback, playOnDevice, startWatchdog]);

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
      pause();
      if (sdkRef.current) sdkRef.current.loadedId = null;
      embedOpenRef.current = false;
      setIsEmbedOpen(false);
      trackRef.current = track;
      setCurrentTrack(track);
      setIsMinimized(false);
      commitPlayback(INITIAL_PLAYBACK);
      resume();
    },
    [commitPlayback, pause, resume, togglePlay]
  );

  const closePlayer = useCallback(() => {
    pause();
    if (sdkRef.current) sdkRef.current.loadedId = null;
    trackRef.current = null;
    embedOpenRef.current = false;
    setCurrentTrack(null);
    setIsEmbedOpen(false);
    setIsMinimized(false);
    commitPlayback(INITIAL_PLAYBACK);
  }, [commitPlayback, pause]);

  const seek = useCallback((percent: number) => {
    const sdk = sdkRef.current;
    const duration = playbackRef.current.duration;
    if (!sdk?.loadedId || !duration || !Number.isFinite(percent)) return;
    const bounded = Math.max(0, Math.min(100, percent));
    void sdk.player.seek(Math.round((bounded / 100) * duration)).catch(() => {});
  }, []);

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
      isEmbedOpen,
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
      isEmbedOpen,
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
      <MusicProgressContext.Provider value={progress}>{children}</MusicProgressContext.Provider>
    </MusicPlayerContext.Provider>
  );
}

const defaultMusicPlayerContext: MusicPlayerContextType = {
  ...INITIAL_PLAYBACK,
  currentTrack: null,
  playbackSource: 'embed',
  isEmbedOpen: false,
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
