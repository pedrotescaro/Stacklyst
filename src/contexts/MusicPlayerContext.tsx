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

interface MusicPlayerContextType extends PlaybackState {
  currentTrack: ActiveTrack | null;
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

  const clearWatchdog = useCallback(() => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
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
      disposeController();
      wantsPlayRef.current = false;
      setError(message);
      setIsMinimized(false);
      setPlayback((prev) => ({ ...prev, isPlaying: false, isBuffering: false }));
    },
    [disposeController]
  );

  const startWatchdog = useCallback(() => {
    if (timeoutRef.current !== null) return;
    timeoutRef.current = setTimeout(() => {
      fail('O Spotify demorou para responder. Tente novamente ou abra a faixa no Spotify.');
    }, 15000);
  }, [fail]);

  const applyIntent = useCallback(() => {
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
  }, [fail]);

  const ensureController = useCallback(() => {
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
              const next = {
                isPlaying: playing,
                isBuffering:
                  buffering || (wantsPlayRef.current && timeoutRef.current !== null && !playing),
                position,
                duration,
                progress: duration ? Math.min(100, (position / duration) * 100) : 0,
              };
              playbackRef.current = next;
              setPlayback((prev) =>
                Object.keys(next).every(
                  (key) => prev[key as keyof PlaybackState] === next[key as keyof PlaybackState]
                )
                  ? prev
                  : next
              );
            });
          }
        );
      })
      .catch(() => {
        if (generation === generationRef.current) fail();
      });
  }, [applyIntent, clearWatchdog, fail, startWatchdog]);

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
    disposeController();
    setCurrentTrack(null);
    setError(null);
    setIsMinimized(false);
    playbackRef.current = INITIAL_PLAYBACK;
    setPlayback(INITIAL_PLAYBACK);
  }, [disposeController]);

  const seek = useCallback(
    (percent: number) => {
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
