/** Minimal typings and loader for Spotify's Web Playback SDK (Premium only). */

export interface SpotifySdkTrack {
  id: string | null;
  uri: string;
  linked_from?: { id: string | null; uri: string | null };
}

export interface SpotifySdkState {
  paused: boolean;
  loading?: boolean;
  position: number;
  duration: number;
  track_window: { current_track: SpotifySdkTrack | null };
}

export interface SpotifySdkPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  activateElement?: () => Promise<void>;
  addListener: (event: string, callback: (payload: any) => void) => boolean;
  getCurrentState: () => Promise<SpotifySdkState | null>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
}

export interface SpotifySdk {
  Player: new (options: {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume?: number;
  }) => SpotifySdkPlayer;
}

type SdkWindow = Window & {
  Spotify?: SpotifySdk;
  onSpotifyWebPlaybackSDKReady?: () => void;
};

const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';
let pending: Promise<SpotifySdk> | null = null;

export function loadSpotifyWebPlaybackSdk(): Promise<SpotifySdk> {
  const sdkWindow = window as SdkWindow;
  if (sdkWindow.Spotify?.Player) return Promise.resolve(sdkWindow.Spotify);
  if (pending) return pending;
  pending = new Promise<SpotifySdk>((resolve, reject) => {
    const timeout = window.setTimeout(() => fail(), 15000);
    const script = document.createElement('script');
    const fail = () => {
      clearTimeout(timeout);
      script.remove();
      pending = null;
      reject(new Error('Spotify Web Playback SDK unavailable'));
    };
    sdkWindow.onSpotifyWebPlaybackSDKReady = () => {
      clearTimeout(timeout);
      if (sdkWindow.Spotify?.Player) resolve(sdkWindow.Spotify);
      else fail();
    };
    script.src = SDK_URL;
    script.async = true;
    script.addEventListener('error', fail, { once: true });
    document.head.appendChild(script);
  });
  return pending;
}
