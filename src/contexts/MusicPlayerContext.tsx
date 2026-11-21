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
  type SpotifySdkTrack,
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
 * account (Web Playback SDK). `preview`: Spotify's 30-second preview, played in
 * our own player for everyone else.
 */
export type PlaybackSource = 'account' | 'preview';

interface MusicPlayerContextType extends PlaybackState {
  currentTrack: ActiveTrack | null;
  playbackSource: PlaybackSource;
  /** Spotify has no preview for the current track (or it failed to load). */
  previewUnavailable: boolean;
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
/**
 * The last position we saw counts as "at the end" within this margin. Position
 * polls arrive once per second, so the final one lands up to ~1s before the end.
 */
const END_MARGIN_MS = 2500;

/** Plays once inside a tap so Safari lets this element start audio later on. */
const SILENT_WAV = new Uint8Array([
  82, 73, 70, 70, 36, 0, 0, 0, 87, 65, 86, 69, 102, 109, 116, 32, 16, 0, 0, 0, 1, 0, 1, 0, 64, 31,
  0, 0, 64, 31, 0, 0, 1, 0, 8, 0, 100, 97, 116, 97, 0, 0, 0, 0,
]);

function isSameTrack(track: SpotifySdkTrack | null | undefined, id: string) {
  return track?.id === id || track?.linked_from?.id === id;
}

interface AccountPlayer {
  player: SpotifySdkPlayer;
  deviceId: string | null;
  loadedId: string | null;
}

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<ActiveTrack | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [playback, setPlayback] = useState<PlaybackState>(INITIAL_PLAYBACK);
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource>('preview');
  const [previewUnavailable, setPreviewUnavailable] = useState(false);
  const trackRef = useRef<ActiveTrack | null>(null);
  const wantsPlayRef = useRef(false);
  /** The current track plays its preview in our audio element. */
  const previewModeRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false);
  /** Preview URL loaded in the audio element; events from anything else are ignored. */
  const previewUrlRef = useRef<string | null>(null);
  const previewTrackRef = useRef<string | null>(null);
  const previewRequest = useRef<AbortController | null>(null);
  const checkingAccount = useRef(true);
  const sdkRef = useRef<AccountPlayer | null>(null);
  const playRequest = useRef<AbortController | null>(null);
  const playbackRef = useRef(INITIAL_PLAYBACK);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Set when the track played to the end, until the listener plays again. */
  const endedRef = useRef(false);

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

  const isPreviewAudio = useCallback(
    (audio: HTMLAudioElement) =>
      previewModeRef.current &&
      previewUrlRef.current !== null &&
      audio.src === previewUrlRef.current,
    []
  );

  const commitAudio = useCallback(
    (audio: HTMLAudioElement, flags: Pick<PlaybackState, 'isPlaying' | 'isBuffering'>) => {
      const duration =
        Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration * 1000 : 0;
      const position = Math.max(0, (audio.currentTime || 0) * 1000);
      commitPlayback({
        ...flags,
        position,
        duration,
        progress: duration ? Math.min(100, (position / duration) * 100) : 0,
      });
    },
    [commitPlayback]
  );

  const previewFailed = useCallback(() => {
    wantsPlayRef.current = false;
    previewUrlRef.current = null;
    previewTrackRef.current = null;
    setPreviewUnavailable(true);
    commitPlayback(INITIAL_PLAYBACK);
  }, [commitPlayback]);

  const getAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio();
    audio.preload = 'auto';
    const sync = () => {
      if (!isPreviewAudio(audio)) return;
      const playing = wantsPlayRef.current && !audio.paused && !audio.ended;
      commitAudio(audio, {
        isPlaying: playing,
        isBuffering: playbackRef.current.isBuffering && !playing && wantsPlayRef.current,
      });
    };
    audio.addEventListener('playing', () => {
      if (!isPreviewAudio(audio)) return;
      if (!wantsPlayRef.current) {
        audio.pause();
        return;
      }
      commitAudio(audio, { isPlaying: true, isBuffering: false });
    });
    audio.addEventListener('waiting', () => {
      if (isPreviewAudio(audio) && wantsPlayRef.current)
        commitAudio(audio, { isPlaying: false, isBuffering: true });
    });
    audio.addEventListener('timeupdate', sync);
    audio.addEventListener('durationchange', sync);
    audio.addEventListener('pause', () => {
      if (!isPreviewAudio(audio) || audio.ended) return;
      // Also covers pauses from the OS media controls.
      wantsPlayRef.current = false;
      commitAudio(audio, { isPlaying: false, isBuffering: false });
    });
    audio.addEventListener('ended', () => {
      if (!isPreviewAudio(audio)) return;
      // Play once, stop, and rewind so the next play starts from the top.
      wantsPlayRef.current = false;
      audio.currentTime = 0;
      commitAudio(audio, { isPlaying: false, isBuffering: false });
    });
    audio.addEventListener('error', () => {
      if (isPreviewAudio(audio)) previewFailed();
    });
    audioRef.current = audio;
    return audio;
  }, [commitAudio, isPreviewAudio, previewFailed]);

  /** Runs inside the tap so later play() calls still work after awaiting fetch. */
  const unlockAudio = useCallback(() => {
    if (audioUnlocked.current || typeof URL.createObjectURL !== 'function') return;
    audioUnlocked.current = true;
    const audio = getAudio();
    if (audio.src) return;
    const silent = URL.createObjectURL(new Blob([SILENT_WAV], { type: 'audio/wav' }));
    audio.src = silent;
    void Promise.resolve(audio.play())
      .catch(() => {})
      .finally(() => {
        URL.revokeObjectURL(silent);
        if (audio.src === silent) audio.removeAttribute('src');
      });
  }, [getAudio]);

  const resetPreview = useCallback(() => {
    previewRequest.current?.abort();
    previewRequest.current = null;
    previewModeRef.current = false;
    previewUrlRef.current = null;
    previewTrackRef.current = null;
    setPreviewUnavailable(false);
    const audio = audioRef.current;
    if (audio?.src) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  }, []);

  const startPreview = useCallback(() => {
    const track = trackRef.current;
    if (!track || !wantsPlayRef.current) return;
    const audio = getAudio();
    const onPlayRejected = (error: unknown) => {
      const name = (error as { name?: string } | null)?.name;
      if (name === 'AbortError' || trackRef.current !== track) return;
      if (name === 'NotAllowedError') {
        // The browser wants a fresh tap; leave the play button ready for it.
        wantsPlayRef.current = false;
        commitPlayback({ ...playbackRef.current, isPlaying: false, isBuffering: false });
        return;
      }
      previewFailed();
    };
    if (previewTrackRef.current === track.id && previewUrlRef.current) {
      void Promise.resolve(audio.play()).catch(onPlayRejected);
      return;
    }
    previewRequest.current?.abort();
    const controller = new AbortController();
    previewRequest.current = controller;
    void (async () => {
      try {
        const response = await fetch(`/api/spotify/preview/${track.id}`, {
          signal: controller.signal,
        });
        const body = response.ok ? ((await response.json()) as { url?: unknown }) : null;
        if (controller.signal.aborted || trackRef.current !== track) return;
        const url = typeof body?.url === 'string' ? body.url : null;
        if (!url) {
          previewFailed();
          return;
        }
        previewTrackRef.current = track.id;
        audio.src = url;
        previewUrlRef.current = audio.src;
        if (wantsPlayRef.current) await Promise.resolve(audio.play()).catch(onPlayRejected);
      } catch {
        if (!controller.signal.aborted && trackRef.current === track) previewFailed();
      } finally {
        if (previewRequest.current === controller) previewRequest.current = null;
      }
    })();
  }, [commitPlayback, getAudio, previewFailed]);

  /** No Premium playback for this track: play its preview in our own player. */
  const openPreview = useCallback(() => {
    if (!trackRef.current || !wantsPlayRef.current) return;
    stopPending();
    const sdk = sdkRef.current;
    if (sdk?.loadedId) {
      sdk.loadedId = null;
      void sdk.player.pause().catch(() => {});
    }
    previewModeRef.current = true;
    setPlaybackSource('preview');
    commitPlayback({ ...INITIAL_PLAYBACK, isBuffering: true });
    startPreview();
  }, [commitPlayback, startPreview, stopPending]);

  const startWatchdog = useCallback(() => {
    if (timeoutRef.current === null) {
      timeoutRef.current = setTimeout(openPreview, PLAYBACK_TIMEOUT);
    }
  }, [openPreview]);

  const playOnDevice = useCallback(() => {
    const track = trackRef.current;
    const sdk = sdkRef.current;
    if (!track || !wantsPlayRef.current || previewModeRef.current) return;
    if (!sdk?.deviceId) {
      if (!checkingAccount.current && !sdk) openPreview();
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
          if (!started && !controller.signal.aborted) openPreview();
        }
      } catch {
        if (!controller.signal.aborted) openPreview();
      } finally {
        if (playRequest.current === controller) playRequest.current = null;
      }
    })();
  }, [openPreview]);

  /**
   * The track played once to the end: stop there instead of letting Spotify's
   * autoplay continue with another song, and rewind so play starts it again.
   */
  const finishTrack = useCallback(() => {
    wantsPlayRef.current = false;
    endedRef.current = true;
    stopPending();
    const sdk = sdkRef.current;
    if (sdk) {
      sdk.loadedId = null;
      void sdk.player.pause().catch(() => {});
    }
    commitPlayback({ ...INITIAL_PLAYBACK, duration: playbackRef.current.duration });
  }, [commitPlayback, stopPending]);

  const handleSdkState = useCallback(
    (state: SpotifySdkState | null) => {
      const track = trackRef.current;
      const sdk = sdkRef.current;
      if (!state || !sdk?.deviceId || previewModeRef.current) return;
      if (endedRef.current) {
        // Spotify may already be starting an autoplay track on this device.
        if (!state.paused) void sdk.player.pause().catch(() => {});
        return;
      }
      if (!track || sdk.loadedId !== track.id) return;
      const current = state.track_window?.current_track;
      const last = playbackRef.current;
      const reachedEnd =
        last.duration > 0 &&
        last.position >= last.duration - END_MARGIN_MS &&
        (wantsPlayRef.current || last.isPlaying);
      if (!isSameTrack(current, track.id)) {
        // Spotify moved on to the next (autoplay) track after ours ended.
        const playedOurs = state.track_window?.previous_tracks?.some((previous) =>
          isSameTrack(previous, track.id)
        );
        if (last.duration > 0 && (playedOurs || reachedEnd)) finishTrack();
        return;
      }
      if (reachedEnd && state.paused && state.position === 0) {
        finishTrack();
        return;
      }
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
    [clearWatchdog, commitPlayback, finishTrack, startWatchdog]
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
      setPlaybackSource('preview');
      openPreview();
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
          if (!previewModeRef.current) setPlaybackSource('account');
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
        const usePreviewIfPlaying = () => {
          if (sdkRef.current === entry && entry.loadedId === trackRef.current?.id) openPreview();
        };
        player.addListener('playback_error', usePreviewIfPlaying);
        player.addListener('autoplay_failed', usePreviewIfPlaying);
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
  }, [commitPlayback, handleSdkState, openPreview, playOnDevice, startWatchdog, stopPending]);

  const pause = useCallback(() => {
    wantsPlayRef.current = false;
    stopPending();
    previewRequest.current?.abort();
    previewRequest.current = null;
    const sdk = sdkRef.current;
    if (sdk?.loadedId) {
      void sdk.player.pause().catch(() => {});
    }
    if (previewModeRef.current) audioRef.current?.pause();
    commitPlayback({ ...playbackRef.current, isPlaying: false, isBuffering: false });
  }, [commitPlayback, stopPending]);

  const resume = useCallback(() => {
    if (!trackRef.current) return;
    wantsPlayRef.current = true;
    unlockAudio();
    if (previewModeRef.current) {
      setPreviewUnavailable(false);
      commitPlayback({ ...playbackRef.current, isPlaying: false, isBuffering: true });
      startPreview();
      return;
    }
    void sdkRef.current?.player.activateElement?.().catch(() => {});
    // After the track ended, play starts it again from the beginning.
    const base = endedRef.current ? INITIAL_PLAYBACK : playbackRef.current;
    endedRef.current = false;
    commitPlayback({ ...base, isPlaying: false, isBuffering: true });
    startWatchdog();
    playOnDevice();
  }, [commitPlayback, playOnDevice, startPreview, startWatchdog, unlockAudio]);

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
      endedRef.current = false;
      resetPreview();
      trackRef.current = track;
      setCurrentTrack(track);
      setIsMinimized(false);
      commitPlayback(INITIAL_PLAYBACK);
      resume();
    },
    [commitPlayback, pause, resetPreview, resume, togglePlay]
  );

  const closePlayer = useCallback(() => {
    pause();
    endedRef.current = false;
    if (sdkRef.current) sdkRef.current.loadedId = null;
    trackRef.current = null;
    resetPreview();
    setCurrentTrack(null);
    setIsMinimized(false);
    commitPlayback(INITIAL_PLAYBACK);
  }, [commitPlayback, pause, resetPreview]);

  useEffect(
    () => () => {
      previewRequest.current?.abort();
      audioRef.current?.pause();
    },
    []
  );

  const seek = useCallback(
    (percent: number) => {
      const sdk = sdkRef.current;
      const current = playbackRef.current;
      if (!sdk?.loadedId || !current.duration || !Number.isFinite(percent)) return;
      const bounded = Math.max(0, Math.min(100, percent));
      const position = Math.round((bounded / 100) * current.duration);
      // Show the new position right away; the SDK confirms it a moment later.
      commitPlayback({ ...current, position, progress: bounded });
      void sdk.player.seek(position).catch(() => {});
    },
    [commitPlayback]
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
      previewUnavailable,
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
      previewUnavailable,
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
  playbackSource: 'preview',
  previewUnavailable: false,
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
