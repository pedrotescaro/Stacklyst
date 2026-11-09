'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

export interface ActiveTrack {
  id: string; // Spotify track ID
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

interface MusicPlayerContextType {
  currentTrack: ActiveTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  isMinimized: boolean;
  position: number;
  duration: number;
  progress: number;
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

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

let cachedIFrameAPI: any = null;
let scriptLoading = false;
const scriptCallbacks: Array<(api: any) => void> = [];

function loadSpotifyIframeApi(callback: (api: any) => void) {
  if (typeof window === 'undefined') return;

  if (cachedIFrameAPI || (window as any).SpotifyIframeApi) {
    callback(cachedIFrameAPI || (window as any).SpotifyIframeApi);
    return;
  }

  if (process.env.NODE_ENV === 'test') {
    const mockApi = {
      createController: (_el: any, _options: any, cb: (c: any) => void) => {
        cb({
          loadUri: () => {},
          play: () => {},
          pause: () => {},
          togglePlay: () => {},
          seek: () => {},
          destroy: () => {},
          addListener: (_event: string, _handler: () => void) => {},
        });
      },
    };
    cachedIFrameAPI = mockApi;
    callback(mockApi);
    return;
  }

  scriptCallbacks.push(callback);

  if (scriptLoading) return;
  scriptLoading = true;

  const prevReady = (window as any).onSpotifyIframeApiReady;
  (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
    cachedIFrameAPI = IFrameAPI;
    (window as any).SpotifyIframeApi = IFrameAPI;
    if (typeof prevReady === 'function') {
      try {
        prevReady(IFrameAPI);
      } catch {
        // ignore
      }
    }
    while (scriptCallbacks.length > 0) {
      const cb = scriptCallbacks.shift();
      cb?.(IFrameAPI);
    }
  };

  const existingScript = document.querySelector('script[src*="iframe-api/v1"]');
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    document.body.appendChild(script);
  }
}

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<ActiveTrack | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: false,
    isBuffering: false,
    position: 0,
    duration: 30000,
    progress: 0,
  });

  const controllerRef = useRef<any>(null);
  const embedContainerRef = useRef<HTMLDivElement | null>(null);
  const pendingTrackRef = useRef<ActiveTrack | null>(null);

  // Initialize controller when a track is requested and container exists
  const ensureController = useCallback((track: ActiveTrack) => {
    if (controllerRef.current) {
      controllerRef.current.loadUri(`spotify:track:${track.id}`);
      if (process.env.NODE_ENV === 'test') {
        try {
          controllerRef.current?.play();
        } catch {
          // ignore
        }
      } else {
        setTimeout(() => {
          try {
            controllerRef.current?.play();
          } catch {
            // ignore
          }
        }, 150);
      }
      return;
    }

    pendingTrackRef.current = track;

    loadSpotifyIframeApi((IFrameAPI) => {
      if (!embedContainerRef.current) return;
      const targetTrack = pendingTrackRef.current || track;

      // Clean container in case of re-mount
      embedContainerRef.current.innerHTML = '';
      const mountTarget = document.createElement('div');
      embedContainerRef.current.appendChild(mountTarget);

      const options = {
        uri: `spotify:track:${targetTrack.id}`,
        width: 0,
        height: 0,
      };

      IFrameAPI.createController(mountTarget, options, (EmbedController: any) => {
        controllerRef.current = EmbedController;

        EmbedController.addListener('playback_update', (e: any) => {
          if (e?.data) {
            const { isPaused, isBuffering, position, duration } = e.data;
            const pos = typeof position === 'number' ? position : 0;
            const dur = typeof duration === 'number' && duration > 0 ? duration : 30000;
            const playing = !isPaused && !isBuffering;

            setPlayback({
              isPlaying: playing,
              isBuffering: Boolean(isBuffering),
              position: pos,
              duration: dur,
              progress: dur > 0 ? Math.min(100, Math.max(0, (pos / dur) * 100)) : 0,
            });
          }
        });

        EmbedController.addListener('ready', () => {
          try {
            EmbedController.play();
          } catch {
            // ignore
          }
        });
      });
    });
  }, []);

  const currentTrackRef = useRef<ActiveTrack | null>(null);
  const isPlayingRef = useRef(false);
  currentTrackRef.current = currentTrack;
  isPlayingRef.current = playback.isPlaying;

  const playTrack = useCallback(
    (track: ActiveTrack) => {
      if (currentTrackRef.current?.id === track.id) {
        // Same track clicked: toggle play/pause
        if (isPlayingRef.current) {
          try {
            controllerRef.current?.pause();
          } catch {
            // ignore
          }
          setPlayback((prev) => ({ ...prev, isPlaying: false }));
        } else {
          try {
            controllerRef.current?.play();
          } catch {
            // ignore
          }
          setPlayback((prev) => ({ ...prev, isPlaying: true }));
        }
        return;
      }

      // New track
      setCurrentTrack(track);
      setIsMinimized(false);
      setPlayback({
        isPlaying: true,
        isBuffering: true,
        position: 0,
        duration: 30000,
        progress: 0,
      });

      ensureController(track);
    },
    [ensureController]
  );

  const togglePlay = useCallback(() => {
    if (!controllerRef.current) return;
    try {
      controllerRef.current.togglePlay();
      setPlayback((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    } catch {
      // ignore
    }
  }, []);

  const pause = useCallback(() => {
    if (!controllerRef.current) return;
    try {
      controllerRef.current.pause();
      setPlayback((prev) => ({ ...prev, isPlaying: false }));
    } catch {
      // ignore
    }
  }, []);

  const resume = useCallback(() => {
    if (!controllerRef.current) return;
    try {
      controllerRef.current.play();
      setPlayback((prev) => ({ ...prev, isPlaying: true }));
    } catch {
      // ignore
    }
  }, []);

  const minimize = useCallback(() => setIsMinimized(true), []);
  const expand = useCallback(() => setIsMinimized(false), []);
  const toggleMinimize = useCallback(() => setIsMinimized((prev) => !prev), []);

  const closePlayer = useCallback(() => {
    try {
      controllerRef.current?.pause();
    } catch {
      // ignore
    }
    setCurrentTrack(null);
    setIsMinimized(false);
    setPlayback({
      isPlaying: false,
      isBuffering: false,
      position: 0,
      duration: 30000,
      progress: 0,
    });
  }, []);

  const seek = useCallback((percent: number) => {
    if (!controllerRef.current) return;
    const bounded = Math.max(0, Math.min(100, percent));
    setPlayback((prev) => {
      const targetSeconds = (bounded / 100) * (prev.duration / 1000);
      try {
        controllerRef.current.seek(Math.round(targetSeconds));
      } catch {
        // ignore
      }
      return {
        ...prev,
        progress: bounded,
        position: targetSeconds * 1000,
      };
    });
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying: playback.isPlaying,
        isBuffering: playback.isBuffering,
        isMinimized,
        position: playback.position,
        duration: playback.duration,
        progress: playback.progress,
        playTrack,
        togglePlay,
        pause,
        resume,
        minimize,
        expand,
        toggleMinimize,
        closePlayer,
        seek,
      }}
    >
      {children}
      {/* Hidden container where Spotify iFrame API manages the single audio embed */}
      <div
        ref={embedContainerRef}
        id="spotify-iframe-embed-host"
        className="pointer-events-none fixed -bottom-[9999px] -right-[9999px] h-1 w-1 opacity-0 overflow-hidden"
        aria-hidden="true"
      />
    </MusicPlayerContext.Provider>
  );
}

const defaultMusicPlayerContext: MusicPlayerContextType = {
  currentTrack: null,
  isPlaying: false,
  isBuffering: false,
  isMinimized: false,
  position: 0,
  duration: 0,
  progress: 0,
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
  const context = useContext(MusicPlayerContext);
  return context ?? defaultMusicPlayerContext;
}
