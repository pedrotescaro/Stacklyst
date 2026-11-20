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
const PLAYER_API = 'https://api.spotify.com/v1/me/player';
let pending: Promise<SpotifySdk> | null = null;

function waitForDevice(delay: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    signal.throwIfAborted();
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, delay);
    function onAbort() {
      clearTimeout(timer);
      reject(signal.reason);
    }
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/** An SDK device can emit ready before it appears in Spotify Connect. */
export async function startSpotifyTrack(
  token: string,
  deviceId: string,
  trackId: string,
  signal: AbortSignal
) {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const play = () =>
    fetch(`${PLAYER_API}/play?device_id=${encodeURIComponent(deviceId)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
      signal,
    });

  const first = await play();
  if (first.ok) return true;
  if (first.status !== 404) return false;

  let transferred = false;
  for (const delay of [0, 250, 500, 1000, 1500]) {
    await waitForDevice(delay, signal);
    const response = await fetch(`${PLAYER_API}/devices`, { headers, signal, cache: 'no-store' });
    if (!response.ok) return false;
    const { devices } = (await response.json()) as {
      devices?: { id?: string; is_active?: boolean; is_restricted?: boolean }[];
    };
    const device = devices?.find(({ id }) => id === deviceId);
    if (!device) continue;
    if (device.is_restricted) return false;
    if (device.is_active) return (await play()).ok;
    if (transferred) continue;

    const transfer = await fetch(PLAYER_API, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ device_ids: [deviceId], play: false }),
      signal,
    });
    if (!transfer.ok && transfer.status !== 404) return false;
    transferred = transfer.ok;
  }
  return false;
}

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
